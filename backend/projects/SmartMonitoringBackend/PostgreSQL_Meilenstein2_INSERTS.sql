INSERT INTO smartmonitoring_dachanlage.smartmonitoring.tbl_card
(id, available, description, maxspan_beginn, maxspan_end, resource, total, type)
VALUES
-- recource URL auf vorbehalt. Bitte im Frontend prüfen.
(DEFAULT, TRUE,'This is an example card 1',TIMESTAMP '2022-01-01 00:00:01',TIMESTAMP '2022-11-17 16:17:54','http://localhost:28080/SmartData/smartdata/records/tbl_observedobject?storage=smartmonitoring',TRUE,'Wetter'),
(DEFAULT, FALSE,'This is an example card 2',TIMESTAMP '2022-01-01 00:00:01',TIMESTAMP '2022-11-17 16:17:54','http://localhost:28080/SmartData/smartdata/records/tbl_observedobject?storage=smartmonitoring',TRUE,'Wetter'),
(DEFAULT, TRUE,'This is an example card 3',TIMESTAMP '2022-01-01 00:00:01',TIMESTAMP '2022-11-17 16:17:54','http://localhost:28080/SmartData/smartdata/records/tbl_observedobject?storage=smartmonitoring',FALSE,'Wetter'),
(DEFAULT, FALSE,'This is an example card 4',TIMESTAMP '2022-01-01 00:00:01',TIMESTAMP '2022-11-17 16:17:54','http://localhost:28080/SmartData/smartdata/records/tbl_observedobject?storage=smartmonitoring',FALSE,'Wetter');
-- Resource Smartdata: http://git04-ifm-min.ad.fh-bielefeld.de/forschung/smartecosystem/smartdata/-/wikis/Funktionen/RecordsResource

INSERT INTO smartmonitoring_dachanlage.smartmonitoring.tbl_card_join_oo
(card_id, observedobject_id)
VALUES
(1,16),
(2,17),
(3,18);