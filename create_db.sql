drop table if exists Locations;

create table Locations(
Time DATETIME primary key,
Latt REAL,
Long REAL,
Velocity INT,
Moving BOOLEAN
);