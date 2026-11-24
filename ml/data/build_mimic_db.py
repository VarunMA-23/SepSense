"""Load MIMIC-IV demo CSV files into a SQLite database for Sepsense."""

import argparse
import sqlite3
from pathlib import Path

import pandas as pd

CHUNKSIZE = 100_000

INDEXES = {
    "admissions": ["hadm_id", "subject_id"],
    "patients": ["subject_id"],
    "diagnoses_icd": ["hadm_id", "icd_code"],
    "chartevents": ["hadm_id", "itemid", "charttime"],
    "labevents": ["hadm_id", "itemid", "charttime"],
    "procedureevents": ["hadm_id", "itemid", "starttime"],
    "icustays": ["hadm_id", "stay_id"],
    "d_items": ["itemid"],
    "d_labitems": ["itemid"],
}


def normalize_ids(df: pd.DataFrame) -> pd.DataFrame:
    """Store identifier columns as integers so SQL joins work reliably."""
    for column in df.columns:
        name = column.lower()
        if not (name.endswith("id") or name.endswith("_id")):
            continue
        numeric = pd.to_numeric(df[column], errors="coerce")
        if numeric.isna().all():
            continue
        values = numeric.dropna()
        if ((values % 1) == 0).all():
            df[column] = numeric.astype("Int64")
    return df


def load_csv(csv_path: Path, table: str, connection: sqlite3.Connection) -> int:
    """Stream a CSV into SQLite and return the number of rows loaded."""
    rows = 0
    reader = pd.read_csv(csv_path, chunksize=CHUNKSIZE, low_memory=False)
    for chunk in reader:
        chunk = normalize_ids(chunk)
        chunk.to_sql(
            table,
            connection,
            if_exists="replace" if rows == 0 else "append",
            index=False,
        )
        rows += len(chunk)
    return rows


def build(csv_dir: Path, db_path: Path) -> None:
    """Load every CSV in hosp/ and icu/ into the SQLite database."""
    if not csv_dir.is_dir():
        raise FileNotFoundError(f"CSV directory not found: {csv_dir}")
    db_path.parent.mkdir(parents=True, exist_ok=True)

    csv_files = sorted([*csv_dir.glob("hosp/*.csv"), *csv_dir.glob("icu/*.csv")])
    if not csv_files:
        raise FileNotFoundError(f"No CSV files found under {csv_dir}")

    if db_path.exists():
        db_path.unlink()

    with sqlite3.connect(db_path) as connection:
        for csv_path in csv_files:
            table = csv_path.stem
            rows = load_csv(csv_path, table, connection)
            print(f"{table:24s} {rows:>8d} rows")

        for table, columns in INDEXES.items():
            exists = connection.execute(
                "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?", (table,)
            ).fetchone()
            if not exists:
                continue
            for column in columns:
                index = f"idx_{table}_{column}"
                connection.execute(f"CREATE INDEX {index} ON {table} ({column})")
        connection.commit()

    print(f"\nDatabase written to {db_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Build the MIMIC-IV demo SQLite database")
    parser.add_argument(
        "--csv-dir",
        type=Path,
        default=Path("mimic-iv-clinical-database-demo-2.2"),
        help="Directory containing hosp/ and icu/ CSV files",
    )
    parser.add_argument(
        "--db-path",
        type=Path,
        default=Path("_data/mimic_demo.db"),
        help="Destination SQLite database",
    )
    args = parser.parse_args()
    build(args.csv_dir, args.db_path)


if __name__ == "__main__":
    main()
