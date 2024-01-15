var jobs = [
  {
    id: 1,
    name: "Update Server",
    startTime: '11:00',
    repeat: "Weekly",
    subjobs: 2,
    status: "active",
    active: true,
    problem:'uk-label uk-label-success',
  }, {
    id: 2,
    name: "Check Docker",
    startTime: '03:00',
    repeat: "Daily",
    subjobs: 0,
    status: "active",
    active: true,
    problem: 'uk-label uk-label-success',
  }, {
    id: 3,
    name: "Ping Host 1",
    startTime: '06:00',
    repeat: "Every 6 hours",
    subjobs: 0,
    status: "passive",
    active: false,
    problem:'uk-label uk-label-danger',
  }
];

// Test for the backend
jobs = [];
