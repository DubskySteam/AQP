-- Copyright 2004-2023 H2 Group. Multiple-Licensed under the MPL 2.0,
-- and the EPL 1.0 (https://h2database.com/html/license.html).
-- Initial Developer: H2 Group
--

select sin(null) vn, sin(-1) r1;
> VN   R1
> ---- -------------------
> null -0.8414709848078965
> rows: 1
