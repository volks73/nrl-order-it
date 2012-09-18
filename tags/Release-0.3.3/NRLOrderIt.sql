DROP TABLE IF EXISTS "companies";
CREATE TABLE "companies" 
(
	"companies_id" INTEGER PRIMARY KEY NOT NULL,
	"name" VARCHAR,
	"address" VARCHAR,
	"phone" VARCHAR,
	"fax" VARCHAR,
	"website" VARCHAR,
	"date_added" INTEGER DEFAULT NULL,
	"date_deleted" INTEGER DEFAULT NULL
);

DROP TABLE IF EXISTS "hazmat_codes";
CREATE TABLE "hazmat_codes" 
(
	"hazmat_codes_id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	"letter" CHAR NOT NULL, 
	"description" VARCHAR NOT NULL 
);

INSERT INTO "hazmat_codes" VALUES(1,'B','Biohazard');
INSERT INTO "hazmat_codes" VALUES(2,'C','Corrosive');
INSERT INTO "hazmat_codes" VALUES(3,'D','Gases/Toxic');
INSERT INTO "hazmat_codes" VALUES(4,'E','Explosive');
INSERT INTO "hazmat_codes" VALUES(5,'J','Gases/Flammable');
INSERT INTO "hazmat_codes" VALUES(6,'K','Flammable Solid');
INSERT INTO "hazmat_codes" VALUES(7,'L','Spontaneous Combustion');
INSERT INTO "hazmat_codes" VALUES(8,'M','Miscellaneous Dangerous Goods');
INSERT INTO "hazmat_codes" VALUES(9,'N','Non Hazardous');
INSERT INTO "hazmat_codes" VALUES(10,'O','Oxidizer');
INSERT INTO "hazmat_codes" VALUES(11,'P','Poisonous/Toxic Substance');
INSERT INTO "hazmat_codes" VALUES(12,'R','Radioactive');
INSERT INTO "hazmat_codes" VALUES(13,'T','Organic Peroxide');
INSERT INTO "hazmat_codes" VALUES(14,'U','Gases/Non-Flammable');
INSERT INTO "hazmat_codes" VALUES(15,'W','Water Reactive');
INSERT INTO "hazmat_codes" VALUES(16,'X','Flammable Liquid');

DROP TABLE IF EXISTS "items";
CREATE TABLE "items" 
(
	"items_id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	"purchase_orders_id" INTEGER,
	"hazmat_codes_id" INTEGER, 
	"part_number" VARCHAR, 
	"description" TEXT, 
	"unit_of_issue" VARCHAR, 
	"unit_price" INTEGER,  
	"quantity" INTEGER, 
	"date_added" INTEGER
);

DROP TABLE IF EXISTS "job_order_numbers";
CREATE TABLE "job_order_numbers" 
(
	"job_order_numbers_id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	"job_order_number" VARCHAR, 
	"name" VARCHAR, 
	"description" TEXT, 
	"date_added" INTEGER, 
	"date_deleted" INTEGER
);

DROP TABLE IF EXISTS "purchase_orders";
CREATE TABLE "purchase_orders" 
(
	"purchase_orders_id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	"job_order_numbers_id" INTEGER NOT NULL,
	"companies_id" INTEGER NOT NULL,
	"title" VARCHAR,
	"originator" VARCHAR,
	"deliver_to" VARCHAR,
	"priority" VARCHAR,
	"notes" TEXT,
	"date_submitted" INTEGER,
	"date_received" INTEGER,
	"date_added" INTEGER,
	"date_required" INTEGER
);