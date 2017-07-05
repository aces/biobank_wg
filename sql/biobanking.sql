-- -------------------------------------------------
-- Config module entries for the biobanking module
-- -------------------------------------------------

INSERT INTO ConfigSettings (Name, Description, Visible, AllowMultiple, DataType, Parent, Label, OrderNumber) 
SELECT 'generate_biospecimen_barcodes', 'Whether bar codes for the biospecimens are automatically generated or entered manually', 1, 0, 'boolean', ID,  'Generate bar codes', 1 FROM ConfigSettings WHERE name='biobanking';


-- ----------------------
-- Table biospecimen
-- ----------------------

DROP TABLE IF EXISTS `biospecimen`;
CREATE TABLE `biospecimen` (
  id                      varchar(255)                             DEFAULT NULL,
  excluded                enum('Y', 'N')                           DEFAULT 'N',
  subject_id              varchar(20)                              NOT NULL,
  subject_dob             date                                     DEFAULT NULL,
  project_id              tinyint                                  NOT NULL,
  collection_date         date                                     DEFAULT NULL,
  date_sorted             date                                     DEFAULT NULL,
  collection_ra_id        smallint                                 DEFAULT NULL,
  timepoint               enum('dna_methylation', 'dna_methylation_T2' , 'dna_methylation_T3', 'dna_methylation_T4', 'MRI10years')  DEFAULT NULL,
  timepoint_pscid         varchar(20)                              DEFAULT NULL,
  type_id                 tinyint                                  NOT NULL,
  time                    time                                     DEFAULT NULL,                   
  woke                    time                                     DEFAULT NULL,
  nb_samples              tinyint                                  DEFAULT NULL,
  status_id               tinyint                                  NOT NULL,
  
  freezer_id              enum('MM3','MM13','MM14', 'MM15')        DEFAULT NULL,
  bag_name                varchar(20)                              DEFAULT NULL,
  buccal_rack_id          varchar(20)                              DEFAULT NULL,
  buccal_rack_coordinates varchar(20)                              DEFAULT NULL,
  shelf_num               tinyint                                  DEFAULT NULL,
  rack_num                tinyint                                  DEFAULT NULL,
  box_name                varchar(20)                              DEFAULT NULL,
  box_coordinates         varchar(20)                              DEFAULT NULL,
  
  oragene_location        enum('E-4104')                           DEFAULT NULL,
  collection_notes        varchar(255)                             DEFAULT NULL,

  extraction_date         date                                     DEFAULT NULL,
  batch_name              varchar(255)                             DEFAULT NULL,
  protocol                varchar(255)                             DEFAULT NULL,
  elution_volume          smallint                                 DEFAULT NULL,
  pass_fail               enum('pass','fail')                      DEFAULT NULL,
  lab_ra_id               tinyint                                  DEFAULT NULL,
  dna_concentration       float                                    DEFAULT NULL,
  two_sixty_two_eighty    float                                    DEFAULT NULL,
  available_sample_volume float                                    DEFAULT NULL,
  dna_amount              float                                    DEFAULT NULL,
  extraction_notes        varchar(255)                             DEFAULT NULL,
  shipment_date           date                                     DEFAULT NULL,
  ul_for_kobar_lab        float                                    DEFAULT NULL,

  analysis_type           enum('EPIC Array')                       DEFAULT NULL,
  experimental_name       varchar(255)                             DEFAULT NULL,
  technical_batch_num     smallint                                 DEFAULT NULL,
  sample_name             varchar(255)                             DEFAULT NULL,
  chip_position           varchar(255)                             DEFAULT NULL,
  sentrix_id              varchar(255)                             DEFAULT NULL,
  5MC_id                  varchar(255)                             DEFAULT NULL,
  analysis_notes          varchar(255)                             DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX (subject_id, type_id, status_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- -----------------------------
-- Table bipospecimen_status
-- -----------------------------

DROP TABLE IF EXISTS `biospecimen_status`;
CREATE TABLE `biospecimen_status` (
  id                   tinyint      NOT NULL,
  status               varchar(255) NOT NULL,
  PRIMARY KEY (`id`) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
INSERT INTO biospecimen_status VALUES (1 , 'Available');
INSERT INTO biospecimen_status VALUES (2 , 'Extracted');
INSERT INTO biospecimen_status VALUES (3 , 'Sent for analysis');
INSERT INTO biospecimen_status VALUES (4 , 'Sent for analysis (G)');
INSERT INTO biospecimen_status VALUES (5 , 'Sent for analysis (M)');
INSERT INTO biospecimen_status VALUES (6 , 'Sent for analysis (G+M)');
INSERT INTO biospecimen_status VALUES (7 , 'Data available');
INSERT INTO biospecimen_status VALUES (8 , 'Data available (G)');
INSERT INTO biospecimen_status VALUES (9 , 'Data available (M)');
INSERT INTO biospecimen_status VALUES (10, 'Data available (G+M)');
INSERT INTO biospecimen_status VALUES (11, 'Data available (cytokine)');
INSERT INTO biospecimen_status VALUES (12, 'Data available (steroid)');
INSERT INTO biospecimen_status VALUES (13, 'Depleted');
INSERT INTO biospecimen_status VALUES (14, 'Poor quality');
INSERT INTO biospecimen_status VALUES (15, 'Unknown');


-- --------------------------------
-- Table biospecimen_sample_type
-- --------------------------------

DROP TABLE IF EXISTS `biospecimen_type`;
CREATE TABLE `biospecimen_type` (
  id                   tinyint      NOT NULL,
  type                 varchar(255) NOT NULL,
  PRIMARY KEY (`id`) 
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO biospecimen_type VALUES (1,  'EDTA Tube');
INSERT INTO biospecimen_type VALUES (2,  'gDNA (blood) Stock');
INSERT INTO biospecimen_type VALUES (3,  'gDNA (blood) Dilution');

INSERT INTO biospecimen_type VALUES (4,  'Paxgene Tube');
INSERT INTO biospecimen_type VALUES (5,  'Paxgene RNA Stock');
INSERT INTO biospecimen_type VALUES (6,  'RNA Aliquot');

INSERT INTO biospecimen_type VALUES (7,  'Buccal Swabs');
INSERT INTO biospecimen_type VALUES (8,  'Buccal DNA Stock');
INSERT INTO biospecimen_type VALUES (9,  'Buccal DNA Dilution');

INSERT INTO biospecimen_type VALUES (10, 'Oragene Tube');
INSERT INTO biospecimen_type VALUES (11, 'Oragene DNA Stock');
INSERT INTO biospecimen_type VALUES (12, 'Oragene DNA Dilution');

INSERT INTO biospecimen_type VALUES (13, 'Saliva Stock');
INSERT INTO biospecimen_type VALUES (14, 'Aliquot');

INSERT INTO biospecimen_type VALUES (15, 'Unknown');


-- ------------------------
--  biobanking_ra table
-- ------------------------

DROP TABLE IF EXISTS `biobanking_ra`;
CREATE TABLE `biobanking_ra` (
  id                      smallint                             NOT NULL,
  name                    varchar(255)                         NOT NULL,
  active                  enum('Y','N')                        NOT NULL,
  role                    enum('collection', 'extraction')     NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- ----------------------------
-- Update to permission table
-- ----------------------------
INSERT INTO permissions (`code`, `description`, `categoryID`) 
VALUE ('view_biobanking', 'View the biospecimens in the biobanking module', 2),
      ('edit_biobanking', 'Edit the biospecimens in the biobanking module', 2);


-- ------------------------
-- LorisMenu table update
-- ------------------------
INSERT INTO LorisMenu (`Parent`,`Label`,`Link`,`Visible`,`OrderNumber`) 
VALUES (5, 'Biobanking', '/biobanking/', NULL, 9);

INSERT INTO LorisMenuPermissions 
VALUES ((SELECT id FROM LorisMenu WHERE label='Biobanking'), (SELECT permid FROM permissions WHERE code ='view_biobanking')),
       ((SELECT id FROM LorisMenu WHERE label='Biobanking'), (SELECT permid FROM permissions WHERE code ='edit_biobanking'));

INSERT INTO user_perm_rel VALUES ((SELECT id FROM users WHERE userid='admin'), (SELECT permid FROM permissions WHERE code ='view_biobanking'));
INSERT INTO user_perm_rel VALUES ((SELECT id FROM users WHERE userid='admin'), (SELECT permid FROM permissions WHERE code ='edit_biobanking'));

-- --------------------
-- index_child table
-- -------------------
DROP TABLE IF EXISTS `index_child`;
CREATE TABLE `index_child` (
  pscid               varchar(10)     NOT NULL,
  index_child_pscid   varchar(10)     NOT NULL,
  PRIMARY KEY (`pscid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

