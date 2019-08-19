/*Container*/
INSERT INTO biobank_unit (Label)
VALUES 	('µL'), 
        ('mL')
;

INSERT INTO biobank_container_capacity (Quantity, UnitId)
VALUES 	(10, (select UnitID from biobank_unit where Label='mL')),
        (1000, (select UnitID from biobank_unit where Label='µL'))
;

INSERT INTO biobank_container_dimension (X, XNumerical, Y, YNumerical, Z, ZNumerical)
VALUES 	(1, 1, 5, 1, 1, 1),
        (6, 1, 1, 1, 1, 1),
        (4, 1, 4, 1, 1, 1),
        (1, 1, 3, 1, 1, 1),
        (4, 1, 1, 1, 1, 1),
        (6, 1, 4, 1, 1, 1),
        (10, 0, 10, 1, 1, 1),
        (5, 0, 5, 1, 1, 1),
        (1, 1, 12, 1, 1, 1)
;

INSERT INTO biobank_container_type (Brand, ProductNumber, Label, `Primary`, ContainerCapacityID, ContainerDimensionID)
VALUES 	('FreezerCo.', '##1', 'Freezer - 5 Shelf', 0, NULL,
          (select ContainerDimensionID from biobank_container_dimension where X=1 and Y=5 and Z=1)),
        ('ShelfCo.', '##1', 'Shelf - 6 Rack', 0, NULL,
          (select ContainerDimensionID from biobank_container_dimension where X=6 and Y=1 and Z=1)),
        ('RackCo.', '##1', 'Rack - 16 Box', 0, NULL,
          (select ContainerDimensionID from biobank_container_dimension where X=4 and Y=4 and Z=1)),
        ('FreezerCo.', '##2', 'Freezer - 3 Shelf', 0, NULL,
          (select ContainerDimensionID from biobank_container_dimension where X=1 and Y=3 and Z=1)),
        ('ShelfCo.', '##2', 'Shelf - 4 Rack', 0, NULL,
          (select ContainerDimensionID from biobank_container_dimension where X=4 and Y=1 and Z=1)),
        ('RackCo.', '##2', 'Rack - 28 Box', 0, NULL,
          (select ContainerDimensionID from biobank_container_dimension where X=6 and Y=4 and Z=1)),
        ('MatrixCo.', '##1', 'Matrix Box - 10x10', 0, NULL, 
          (select ContainerDimensionID from biobank_container_dimension where X=10 and Y=10 and Z=1)),
        ('Core Cryolab', 'MVE HEco Series 800-190', 'LN2 Tank', 0, NULL,
          (select ContainerDimensionID from biobank_container_dimension where X=4 and Y=4 and Z=1)),
        ('RackCo.', '##3', 'LN2 Rack - 10x10 box', 0, NULL,
          (select ContainerDimensionID from biobank_container_dimension where X=1 and Y=12 and Z=1)),
        ('RackCo.', '##4', 'LN2 Rack - 5x5 box', 0, NULL,
          (select ContainerDimensionID from biobank_container_dimension where X=1 and Y=12 and Z=1)),
        ('MatrixCo.', '##2', 'Matrix Box - 5x5', 0, NULL, 
          (select ContainerDimensionID from biobank_container_dimension where X=5 and Y=5 and Z=1)),
        ('Vacutainer', '366430', 'Red Top Tube (RTT)', 1,	
          (select ContainerCapacityID from biobank_container_capacity where Quantity=10 
          and UnitID=(select UnitID from biobank_unit where Label='mL')), 
          NULL),
        ('Vacutainer', '366480', 'Green Top Tube (GTT)', 1,
          (select ContainerCapacityID from biobank_container_capacity where Quantity=10 
          and UnitID=(select UnitID from biobank_unit where Label='mL')), 
          NULL),
        ('Vacutainer', '366643', 'Purple Top Tube (PTT)', 1,
          (select ContainerCapacityID from biobank_container_capacity where Quantity=10 
          and UnitID=(select UnitID from biobank_unit where Label='mL')), 
          NULL),
        ('Vacutainer', '###', 'Cryotube Vial', 1,
          (select ContainerCapacityID from biobank_container_capacity where Quantity=1000 
          and UnitID=(select UnitID from biobank_unit where Label='µL')), 
          NULL)
;

/*Specimen*/
INSERT INTO biobank_specimen_type (Label, FreezeThaw)
VALUES 	('Blood', 0),
        ('Urine', 0),
        ('Saliva', 0),
        ('Serum', 1),
        ('Plasma', 1),
        ('DNA', 1),
        ('PBMC', 0),
        ('IPSC', 0),
        ('CSF', 1),
        ('Muscle Biopsy', 0),
        ('Skin Biopsy', 0)
;

INSERT INTO biobank_specimen_type_parent (SpecimenTypeID, ParentSpecimenTypeID)
VALUES ((select SpecimenTypeID from biobank_specimen_type where Label='Serum'),
         (select SpecimenTypeID from biobank_specimen_type where Label='Blood')),
       ((select SpecimenTypeID from biobank_specimen_type where Label='Plasma'),
         (select SpecimenTypeID from biobank_specimen_type where Label='Blood')),
       ((select SpecimenTypeID from biobank_specimen_type where Label='DNA'),
         (select SpecimenTypeID from biobank_specimen_type where Label='Blood')),
       ((select SpecimenTypeID from biobank_specimen_type where Label='DNA'),
         (select SpecimenTypeID from biobank_specimen_type where Label='Saliva')),
       ((select SpecimenTypeID from biobank_specimen_type where Label='PBMC'),
         (select SpecimenTypeID from biobank_specimen_type where Label='Blood'))
;

INSERT INTO biobank_specimen_protocol (Label, SpecimenProcessID, SpecimenTypeID)
VALUES ('Blood Collection',
        (SELECT SpecimenProcessID FROM biobank_specimen_process WHERE Label='Collection'),
        (SELECT SpecimenTypeID FROM biobank_specimen_type WHERE Label='Blood')
       ),
       ('Saliva Collection',
        (SELECT SpecimenProcessID FROM biobank_specimen_process WHERE Label='Collection'),
        (SELECT SpecimenTypeID FROM biobank_specimen_type WHERE Label='Saliva')
       ),
       ('DNA Isolation From Blood (BB-P-0002)',
        (SELECT SpecimenProcessID FROM biobank_specimen_process WHERE Label='Collection'),
        (SELECT SpecimenTypeID FROM biobank_specimen_type WHERE Label='DNA')
       ),
       ('DNA Isolation From Saliva',
        (SELECT SpecimenProcessID FROM biobank_specimen_process WHERE Label='Collection'),
        (SELECT SpecimenTypeID FROM biobank_specimen_type WHERE Label='DNA')
       ),
       ('PBMC Isolation (BB-P-0001)',
        (SELECT SpecimenProcessID FROM biobank_specimen_process WHERE Label='Collection'),
        (SELECT SpecimenTypeID FROM biobank_specimen_type WHERE Label='PBMC')
       ),
       ('Serum Isolation (BB-P-0003)',
        (SELECT SpecimenProcessID FROM biobank_specimen_process WHERE Label='Collection'),
        (SELECT SpecimenTypeID FROM biobank_specimen_type WHERE Label='Serum')
       ),
       ('Blood Processing for PBMC (BB-P-0001)',
        (SELECT SpecimenProcessID FROM biobank_specimen_process WHERE Label='Preparation'),
        (SELECT SpecimenTypeID FROM biobank_specimen_type WHERE Label='Blood')
       ),
       ('Blood Processing for Serum (BB-P-0003)',
        (SELECT SpecimenProcessID FROM biobank_specimen_process WHERE Label='Preparation'),
        (SELECT SpecimenTypeID FROM biobank_specimen_type WHERE Label='Blood')
       ),
       ('Blood Processing for DNA (BB-P-0002)',
        (SELECT SpecimenProcessID FROM biobank_specimen_process WHERE Label='Preparation'),
        (SELECT SpecimenTypeID FROM biobank_specimen_type WHERE Label='Blood')
       ),
       ('Skin Biopsy Processing',
        (SELECT SpecimenProcessID FROM biobank_specimen_process WHERE Label='Preparation'),
        (SELECT SpecimenTypeID FROM biobank_specimen_type WHERE Label='Skin Biopsy')
       ),
       ('Saliva Processing for DNA',
        (SELECT SpecimenProcessID FROM biobank_specimen_process WHERE Label='Preparation'),
        (SELECT SpecimenTypeID FROM biobank_specimen_type WHERE Label='Saliva')
       ),
       ('CSF Processing',
        (SELECT SpecimenProcessID FROM biobank_specimen_process WHERE Label='Preparation'),
        (SELECT SpecimenTypeID FROM biobank_specimen_type WHERE Label='CSF')
       )
;

INSERT INTO biobank_specimen_attribute (Label, DatatypeID, ReferenceTableID)
VALUES 	('Clotted', (SELECT DatatypeID FROM biobank_specimen_attribute_datatype WHERE Datatype='boolean'), NULL), 
        ('Tube Expired', (SELECT DatatypeID FROM biobank_specimen_attribute_datatype WHERE Datatype='boolean'), NULL), 
        ('Incubation Start #1', (SELECT DatatypeID FROM biobank_specimen_attribute_datatype WHERE Datatype='time'), NULL),
        ('Incubation End #1', (SELECT DatatypeID FROM biobank_specimen_attribute_datatype WHERE Datatype='time'), NULL),
        ('Centrifuge Start #1', (SELECT DatatypeID FROM biobank_specimen_attribute_datatype WHERE Datatype='time'), NULL), 
        ('Centrifuge End #1', (SELECT DatatypeID FROM biobank_specimen_attribute_datatype WHERE Datatype='time'), NULL), 
        ('Centrifuge Start #2', (SELECT DatatypeID FROM biobank_specimen_attribute_datatype WHERE Datatype='time'), NULL), 
        ('Centrifuge End #2', (SELECT DatatypeID FROM biobank_specimen_attribute_datatype WHERE Datatype='time'), NULL), 
        ('Centrifuge Start #3', (SELECT DatatypeID FROM biobank_specimen_attribute_datatype WHERE Datatype='time'), NULL), 
        ('Centrifuge End #3', (SELECT DatatypeID FROM biobank_specimen_attribute_datatype WHERE Datatype='time'), NULL), 
        ('Centrifuge Start #4', (SELECT DatatypeID FROM biobank_specimen_attribute_datatype WHERE Datatype='time'), NULL), 
        ('Centrifuge End #4', (SELECT DatatypeID FROM biobank_specimen_attribute_datatype WHERE Datatype='time'), NULL), 
        ('Red Pellet', (SELECT DatatypeID FROM biobank_specimen_attribute_datatype WHERE Datatype='boolean'), NULL), 
        ('Total PBMC Count (10⁶/mL cells)', (SELECT DatatypeID FROM biobank_specimen_attribute_datatype WHERE Datatype='number'), NULL), 
        ('Milky Serum', (SELECT DatatypeID FROM biobank_specimen_attribute_datatype WHERE Datatype='boolean'), NULL), 
        ('Hemolyzed', (SELECT DatatypeID FROM biobank_specimen_attribute_datatype WHERE Datatype='boolean'), NULL), 
        ('Hemodialysis Index', (SELECT DatatypeID FROM biobank_specimen_attribute_datatype WHERE Datatype='number'), NULL),
        ('No Visible Pellet', (SELECT DatatypeID FROM biobank_specimen_attribute_datatype WHERE Datatype='boolean'), NULL),
        ('DNA Concentration (ng/µL)', (SELECT DatatypeID FROM biobank_specimen_attribute_datatype WHERE Datatype='number'), NULL),
        ('260/280 Ratio', (SELECT DatatypeID FROM biobank_specimen_attribute_datatype WHERE Datatype='number'), NULL),
        ('Incubation Start #2', (SELECT DatatypeID FROM biobank_specimen_attribute_datatype WHERE Datatype='time'), NULL),
        ('Incubation End #2', (SELECT DatatypeID FROM biobank_specimen_attribute_datatype WHERE Datatype='time'), NULL),
        ('Incubation Start #3', (SELECT DatatypeID FROM biobank_specimen_attribute_datatype WHERE Datatype='time'), NULL),
        ('Incubation End #3', (SELECT DatatypeID FROM biobank_specimen_attribute_datatype WHERE Datatype='time'), NULL),
        ('Airdry Start #1', (SELECT DatatypeID FROM biobank_specimen_attribute_datatype WHERE Datatype='time'), NULL),
        ('Airdry End #1', (SELECT DatatypeID FROM biobank_specimen_attribute_datatype WHERE Datatype='time'), NULL),
        ('Blood Contamination', (SELECT DatatypeID FROM biobank_specimen_attribute_datatype WHERE Datatype='boolean'), NULL),
        ('Bring To Pathology', (SELECT DatatypeID FROM biobank_specimen_attribute_datatype WHERE Datatype='boolean'), NULL),
        ('Bring To Pathology Start #1', (SELECT DatatypeID FROM biobank_specimen_attribute_datatype WHERE Datatype='time'), NULL),
        ('Bring To Pathology End #1', (SELECT DatatypeID FROM biobank_specimen_attribute_datatype WHERE Datatype='time'), NULL)

;

INSERT INTO biobank_specimen_protocol_attribute_rel (SpecimenProtocolID, SpecimenAttributeID, Required)
VALUES 	((select SpecimenProtocolID from biobank_specimen_protocol where Label='Blood Processing for PBMC (BB-P-0001)'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Clotted'), 0),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Blood Processing for PBMC (BB-P-0001)'), 
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Tube Expired'), 0),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Blood Processing for PBMC (BB-P-0001)'), 
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Centrifuge Start #1'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Blood Processing for PBMC (BB-P-0001)'), 
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Centrifuge End #1'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Blood Processing for PBMC (BB-P-0001)'), 
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Centrifuge Start #2'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Blood Processing for PBMC (BB-P-0001)'), 
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Centrifuge End #2'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Blood Processing for PBMC (BB-P-0001)'), 
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Centrifuge Start #3'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Blood Processing for PBMC (BB-P-0001)'), 
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Centrifuge End #3'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Blood Processing for Serum (BB-P-0003)'), 
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Tube Expired'), 0),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Blood Processing for Serum (BB-P-0003)'), 
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Centrifuge Start #1'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Blood Processing for Serum (BB-P-0003)'), 
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Centrifuge End #1'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Blood Processing for DNA (BB-P-0002)'), 
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Tube Expired'), 0),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Blood Processing for DNA (BB-P-0002)'), 
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Incubation Start #1'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Blood Processing for DNA (BB-P-0002)'), 
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Incubation End #1'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Blood Processing for DNA (BB-P-0002)'), 
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Centrifuge Start #1'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Blood Processing for DNA (BB-P-0002)'), 
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Centrifuge End #1'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Blood Processing for DNA (BB-P-0002)'), 
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Centrifuge Start #2'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Blood Processing for DNA (BB-P-0002)'), 
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Centrifuge End #2'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Blood Processing for DNA (BB-P-0002)'), 
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Centrifuge Start #3'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Blood Processing for DNA (BB-P-0002)'), 
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Centrifuge End #3'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Blood Processing for DNA (BB-P-0002)'), 
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Centrifuge Start #4'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Blood Processing for DNA (BB-P-0002)'), 
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Centrifuge End #4'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Blood Processing for DNA (BB-P-0002)'), 
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Airdry Start #1'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Blood Processing for DNA (BB-P-0002)'), 
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Airdry End #1'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='PBMC Isolation (BB-P-0001)'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Clotted'), 0),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='PBMC Isolation (BB-P-0001)'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Red Pellet'), 0),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='PBMC Isolation (BB-P-0001)'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Total PBMC Count (10⁶/mL cells)'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Serum Isolation (BB-P-0003)'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Milky Serum'), 0),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Serum Isolation (BB-P-0003)'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Hemolyzed'), 0),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Serum Isolation (BB-P-0003)'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Hemodialysis Index'), 0),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='DNA Isolation From Blood (BB-P-0002)'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Red Pellet'), 0),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='DNA Isolation From Blood (BB-P-0002)'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='No Visible Pellet'), 0),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='DNA Isolation From Blood (BB-P-0002)'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='DNA Concentration (ng/µL)'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='DNA Isolation From Blood (BB-P-0002)'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='260/280 Ratio'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Skin Biopsy Processing'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Incubation Start #1'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Skin Biopsy Processing'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Incubation End #1'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Saliva Processing for DNA'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Tube Expired'), 0),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Saliva Processing for DNA'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Incubation Start #1'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Saliva Processing for DNA'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Incubation End #1'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Saliva Processing for DNA'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Incubation Start #2'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Saliva Processing for DNA'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Incubation End #2'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Saliva Processing for DNA'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Incubation Start #3'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Saliva Processing for DNA'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Incubation End #3'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Saliva Processing for DNA'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Airdry Start #1'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='Saliva Processing for DNA'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Airdry End #1'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='DNA Isolation From Saliva'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Red Pellet'), 0),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='DNA Isolation From Saliva'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='No Visible Pellet'), 0),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='DNA Isolation From Saliva'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='DNA Concentration (ng/µL)'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='DNA Isolation From Saliva'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='260/280 Ratio'), 1),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='CSF Processing'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Blood Contamination'), 0),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='CSF Processing'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Tube Expired'), 0),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='CSF Processing'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Bring To Pathology'), 0),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='CSF Processing'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Bring To Pathology Start #1'), 0),
        ((select SpecimenProtocolID from biobank_specimen_protocol where Label='CSF Processing'),
           (select SpecimenAttributeID from biobank_specimen_attribute where Label='Bring To Pathology End #1'), 0)
;

INSERT INTO biobank_specimen_type_unit_rel (SpecimenTypeID, UnitID)
VALUES ((select SpecimenTypeID from biobank_specimen_type where Label='Blood'), 
         (select UnitID from biobank_unit where Label='mL')),
       ((select SpecimenTypeID from biobank_specimen_type where Label='Urine'), 
         (select UnitID from biobank_unit where Label='mL')),
       ((select SpecimenTypeID from biobank_specimen_type where Label='Serum'), 
         (select UnitID from biobank_unit where Label='µL')),
       ((select SpecimenTypeID from biobank_specimen_type where Label='Plasma'), 
         (select UnitID from biobank_unit where Label='µL')),
       ((select SpecimenTypeID from biobank_specimen_type where Label='DNA'), 
         (select UnitID from biobank_unit where Label='µL')),
       ((select SpecimenTypeID from biobank_specimen_type where Label='PBMC'), 
         (select UnitID from biobank_unit where Label='mL')),
       ((select SpecimenTypeID from biobank_specimen_type where Label='CSF'),
         (select UnitID from biobank_unit where Label='µL'))
;

INSERT INTO biobank_specimen_type_container_type_rel (SpecimenTypeID, ContainerTypeID)
VALUES ((select SpecimenTypeID from biobank_specimen_type where Label='Blood'),
        (select ContainerTypeID from biobank_container_type where label='Green Top Tube (GTT)')),
       ((select SpecimenTypeID from biobank_specimen_type where Label='Blood'),
        (select ContainerTypeID from biobank_container_type where label='Red Top Tube (RTT)')),
       ((select SpecimenTypeID from biobank_specimen_type where Label='Blood'),
        (select ContainerTypeID from biobank_container_type where label='Purple Top Tube (PTT)')),
       ((select SpecimenTypeID from biobank_specimen_type where Label='Serum'),
        (select ContainerTypeID from biobank_container_type where label='Cryotube Vial')),
       ((select SpecimenTypeID from biobank_specimen_type where Label='Plasma'),
        (select ContainerTypeID from biobank_container_type where label='Cryotube Vial')),
       ((select SpecimenTypeID from biobank_specimen_type where Label='DNA'),
        (select ContainerTypeID from biobank_container_type where label='Cryotube Vial')),
       ((select SpecimenTypeID from biobank_specimen_type where Label='PBMC'),
        (select ContainerTypeID from biobank_container_type where label='Cryotube Vial'))
;
