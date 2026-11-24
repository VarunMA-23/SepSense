import { isDemoMode } from '../config/demo';

const HOUR = 60 * 60 * 1000;
const DEMO_TIME = Date.now() - 6 * HOUR;

export const DEMO_CLOCK_TIME = new Date(DEMO_TIME).toISOString();

export const demoMode = isDemoMode();

const hoursAgo = (hours) => new Date(DEMO_TIME - hours * HOUR).toISOString();

const makePatient = (subject_id, age, gender) => ({ subject_id, age, gender });

const makeAdmission = (patient, admitHoursAgo, type, location, dischargeHoursAgo) => ({
  event_time: hoursAgo(admitHoursAgo),
  patient,
  admission: { type, location },
  discharge: dischargeHoursAgo === null ? null : { time: hoursAgo(dischargeHoursAgo) },
});

const makeIcuStay = (stayId, intimeHoursAgo, outtimeHoursAgo, careunit) => ({
  stay_id: stayId,
  intime: hoursAgo(intimeHoursAgo),
  outtime: hoursAgo(outtimeHoursAgo),
  careunit,
  first_careunit: careunit,
  last_careunit: careunit,
  los_days: Number(((intimeHoursAgo - outtimeHoursAgo) / 24).toFixed(2)),
  status: 'Completed',
});

const makeLab = (patient, timeHoursAgo, test_name, value_numeric, unit, ref_range, flag) => ({
  event_time: hoursAgo(timeHoursAgo),
  patient,
  lab: { test_name, value_numeric, unit, ref_range, flag },
});

const makeAlert = (patient, timeHoursAgo, probability, risk_level, sofa_score) => ({
  event_time: hoursAgo(timeHoursAgo),
  patient,
  prediction: { sepsis_probability: probability, risk_level, sofa_score },
});

const vitalSeries = (offsets, itemid, label, category, unit, values) => [
  itemid,
  {
    label,
    category,
    param_type: 'Numeric',
    unit,
    values: offsets.map((offset, index) => ({
      time: hoursAgo(offset),
      value_numeric: values[index],
      value_text: null,
    })),
  },
];

const makeVitals = (offsets, series) => Object.fromEntries(
  series.map(([itemid, label, category, unit, values]) =>
    vitalSeries(offsets, itemid, label, category, unit, values)
  )
);

const p1 = makePatient(10000032, 68, 'F');
const p2 = makePatient(10000980, 54, 'M');
const p3 = makePatient(10001284, 73, 'M');
const p4 = makePatient(10001821, 61, 'F');

const a1 = makeAlert(p1, 34, 0.18, 'LOW', 2);
const a2 = makeAlert(p1, 27, 0.42, 'MEDIUM', 4);
const a3 = makeAlert(p1, 18, 0.68, 'HIGH', 6);
const a4 = makeAlert(p1, 8, 0.87, 'CRITICAL', 8);

const b2 = makeAlert(p2, 14, 0.48, 'MEDIUM', 4);
const d2 = makeAlert(p4, 22, 0.61, 'HIGH', 5);
const d3 = makeAlert(p4, 12, 0.66, 'HIGH', 6);

export const createDemoPatients = () => new Map([
  [p1.subject_id, {
    patient: p1,
    firstSeen: new Date(hoursAgo(40)),
    admissions: [makeAdmission(p1, 40, 'EMERGENCY', 'Emergency Room', 4)],
    icuStays: [makeIcuStay(300001, 38, 8, 'MICU')],
    labs: [
      makeLab(p1, 36, 'Lactate', 1.4, 'mmol/L', '0.5-2.2', 'NORMAL'),
      makeLab(p1, 36, 'WBC', 11.2, 'K/uL', '4.0-11.0', 'ABNORMAL'),
      makeLab(p1, 36, 'Creatinine', 1.1, 'mg/dL', '0.6-1.3', 'NORMAL'),
      makeLab(p1, 30, 'Lactate', 2.1, 'mmol/L', '0.5-2.2', 'NORMAL'),
      makeLab(p1, 30, 'WBC', 14.6, 'K/uL', '4.0-11.0', 'ABNORMAL'),
      makeLab(p1, 30, 'Platelets', 178, 'K/uL', '150-400', 'NORMAL'),
      makeLab(p1, 24, 'Lactate', 3.4, 'mmol/L', '0.5-2.2', 'ABNORMAL'),
      makeLab(p1, 24, 'Creatinine', 1.7, 'mg/dL', '0.6-1.3', 'ABNORMAL'),
      makeLab(p1, 24, 'CRP', 96, 'mg/L', '0-10', 'ABNORMAL'),
      makeLab(p1, 18, 'Lactate', 4.2, 'mmol/L', '0.5-2.2', 'ABNORMAL'),
      makeLab(p1, 18, 'WBC', 18.3, 'K/uL', '4.0-11.0', 'ABNORMAL'),
      makeLab(p1, 18, 'Platelets', 121, 'K/uL', '150-400', 'ABNORMAL'),
      makeLab(p1, 12, 'Lactate', 3.8, 'mmol/L', '0.5-2.2', 'ABNORMAL'),
      makeLab(p1, 12, 'Creatinine', 2.0, 'mg/dL', '0.6-1.3', 'ABNORMAL'),
      makeLab(p1, 12, 'CRP', 142, 'mg/L', '0-10', 'ABNORMAL'),
      makeLab(p1, 8, 'Lactate', 3.1, 'mmol/L', '0.5-2.2', 'ABNORMAL'),
      makeLab(p1, 8, 'WBC', 16.9, 'K/uL', '4.0-11.0', 'ABNORMAL'),
      makeLab(p1, 8, 'Platelets', 104, 'K/uL', '150-400', 'ABNORMAL'),
    ],
    chartevents: makeVitals(
      [37, 33, 29, 25, 21, 17, 13, 11],
      [
        [220619, 'Heart Rate', 'Vitals', 'bpm', [104, 112, 118, 126, 121, 132, 138, 141]],
        [220052, 'Mean Arterial Pressure', 'Vitals', 'mmHg', [78, 74, 70, 66, 68, 61, 58, 55]],
        [220277, 'SpO2', 'Vitals', '%', [97, 96, 95, 94, 94, 92, 91, 90]],
        [223761, 'Temperature', 'Vitals', 'C', [37.2, 37.6, 38.1, 38.4, 38.2, 38.8, 39.1, 39.3]],
        [220615, 'Respiratory Rate', 'Vitals', 'breaths/min', [18, 20, 21, 23, 22, 25, 27, 28]],
      ]
    ),
    sepsisAlerts: [a1, a2, a3, a4],
  }],
  [p2.subject_id, {
    patient: p2,
    firstSeen: new Date(hoursAgo(32)),
    admissions: [makeAdmission(p2, 32, 'URGENT', 'Surgical Admissions', 2)],
    icuStays: [makeIcuStay(300002, 30, 12, 'SICU')],
    labs: [
      makeLab(p2, 28, 'Lactate', 1.8, 'mmol/L', '0.5-2.2', 'NORMAL'),
      makeLab(p2, 28, 'WBC', 9.8, 'K/uL', '4.0-11.0', 'NORMAL'),
      makeLab(p2, 20, 'Lactate', 2.4, 'mmol/L', '0.5-2.2', 'ABNORMAL'),
      makeLab(p2, 20, 'Creatinine', 1.4, 'mg/dL', '0.6-1.3', 'ABNORMAL'),
      makeLab(p2, 12, 'Lactate', 2.0, 'mmol/L', '0.5-2.2', 'NORMAL'),
      makeLab(p2, 12, 'CRP', 38, 'mg/L', '0-10', 'ABNORMAL'),
      makeLab(p2, 6, 'WBC', 10.4, 'K/uL', '4.0-11.0', 'NORMAL'),
    ],
    chartevents: makeVitals(
      [29, 25, 21, 17, 13],
      [
        [220619, 'Heart Rate', 'Vitals', 'bpm', [92, 98, 104, 101, 96]],
        [220052, 'Mean Arterial Pressure', 'Vitals', 'mmHg', [84, 80, 76, 79, 82]],
        [220277, 'SpO2', 'Vitals', '%', [98, 97, 97, 98, 98]],
        [223761, 'Temperature', 'Vitals', 'C', [37.1, 37.4, 37.8, 37.6, 37.3]],
      ]
    ),
    sepsisAlerts: [makeAlert(p2, 24, 0.22, 'LOW', 1), b2],
  }],
  [p3.subject_id, {
    patient: p3,
    firstSeen: new Date(hoursAgo(26)),
    admissions: [makeAdmission(p3, 26, 'ELECTIVE', 'Medicine Floor', 3)],
    icuStays: [],
    labs: [
      makeLab(p3, 24, 'Hemoglobin', 13.8, 'g/dL', '12.0-16.0', 'NORMAL'),
      makeLab(p3, 24, 'WBC', 7.2, 'K/uL', '4.0-11.0', 'NORMAL'),
      makeLab(p3, 16, 'Creatinine', 1.0, 'mg/dL', '0.6-1.3', 'NORMAL'),
      makeLab(p3, 8, 'Platelets', 244, 'K/uL', '150-400', 'NORMAL'),
    ],
    chartevents: makeVitals(
      [24, 18, 12, 6],
      [
        [220619, 'Heart Rate', 'Vitals', 'bpm', [72, 76, 74, 70]],
        [220052, 'Mean Arterial Pressure', 'Vitals', 'mmHg', [92, 90, 91, 93]],
        [220277, 'SpO2', 'Vitals', '%', [99, 99, 98, 99]],
      ]
    ),
    sepsisAlerts: [makeAlert(p3, 20, 0.12, 'LOW', 0)],
  }],
  [p4.subject_id, {
    patient: p4,
    firstSeen: new Date(hoursAgo(36)),
    admissions: [makeAdmission(p4, 36, 'EW EMER.', 'Emergency Room', 5)],
    icuStays: [makeIcuStay(300003, 34, 14, 'CCU')],
    labs: [
      makeLab(p4, 32, 'Lactate', 2.0, 'mmol/L', '0.5-2.2', 'NORMAL'),
      makeLab(p4, 32, 'WBC', 12.8, 'K/uL', '4.0-11.0', 'ABNORMAL'),
      makeLab(p4, 26, 'Lactate', 2.8, 'mmol/L', '0.5-2.2', 'ABNORMAL'),
      makeLab(p4, 26, 'Platelets', 165, 'K/uL', '150-400', 'NORMAL'),
      makeLab(p4, 20, 'Creatinine', 1.5, 'mg/dL', '0.6-1.3', 'ABNORMAL'),
      makeLab(p4, 20, 'CRP', 74, 'mg/L', '0-10', 'ABNORMAL'),
      makeLab(p4, 14, 'Lactate', 2.6, 'mmol/L', '0.5-2.2', 'ABNORMAL'),
      makeLab(p4, 14, 'WBC', 13.5, 'K/uL', '4.0-11.0', 'ABNORMAL'),
    ],
    chartevents: makeVitals(
      [33, 29, 25, 21, 17, 15],
      [
        [220619, 'Heart Rate', 'Vitals', 'bpm', [98, 106, 112, 118, 122, 126]],
        [220052, 'Mean Arterial Pressure', 'Vitals', 'mmHg', [80, 76, 72, 70, 67, 64]],
        [220277, 'SpO2', 'Vitals', '%', [97, 96, 95, 94, 93, 93]],
        [220615, 'Respiratory Rate', 'Vitals', 'breaths/min', [19, 21, 22, 24, 25, 26]],
      ]
    ),
    sepsisAlerts: [makeAlert(p4, 30, 0.38, 'MEDIUM', 3), d2, d3],
  }],
]);

const makeRecommendation = (alert, severity) => ({
  sepsis_alert: {
    subject_id: alert.patient.subject_id,
    alert_time: alert.event_time,
    risk_level: alert.prediction.risk_level,
    sepsis_probability: alert.prediction.sepsis_probability,
  },
  immediate_actions: [
    {
      priority: severity === 'CRITICAL' ? 'IMMEDIATE' : 'URGENT',
      action: 'Obtain blood cultures before antibiotics, then start broad-spectrum antibiotics within 1 hour.',
      timing: 'Within 1 hour',
      rationale: 'Surviving Sepsis Campaign hour-1 bundle for suspected sepsis.',
    },
    {
      priority: severity === 'CRITICAL' ? 'IMMEDIATE' : 'URGENT',
      action: 'Begin 30 mL/kg crystalloid fluid resuscitation and reassess perfusion.',
      timing: 'Within 3 hours',
      rationale: 'Early fluid resuscitation improves hemodynamics in septic shock.',
    },
  ],
  monitoring: {
    vital_signs: ['Heart rate', 'Mean arterial pressure', 'SpO2', 'Respiratory rate', 'Temperature'],
    laboratory_tests: ['Lactate', 'WBC', 'Creatinine', 'Platelets', 'CRP'],
    frequency: severity === 'CRITICAL' ? 'Every 30 minutes' : 'Every 1 hour',
  },
  clinical_rationale: `Demo recommendation generated for a ${alert.prediction.risk_level.toLowerCase()} risk signal with SOFA ${alert.prediction.sofa_score}.`,
  evidence_sources: [
    {
      source_file: 'surviving-sepsis-campaign-2021.pdf',
      page_number: severity === 'CRITICAL' ? 14 : 8,
      relevance_score: 0.94,
    },
  ],
  generation_time_ms: 842,
  model_version: 'demo-rag-v1',
});

export const createDemoRecommendations = () => [a4, a3, b2, d2, d3].map((alert) =>
  makeRecommendation(alert, alert.prediction.risk_level)
);
