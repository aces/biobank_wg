INSERT INTO `Project` (Name) VALUES
    ('CRU-HC'),
    ('CRU-ALS')
    ('CRU-NM'),
    ('CRU-PD'),
    ('CRU-MS'),
    ('CRU-BT'),
    ('QPN/CORN');

INSERT INTO `subproject` (Title) VALUES
    ('Control'),
    ('Disease');

INSERT INTO `project_rel` 
    (NULL, 
     SELECT ProjectID FROM Project WHERE Name = 'CRU-HC',
     SELECT SubprojectID FROM subproject WHERE Title = 'Control'
    ),
    (NULL, 
     SELECT ProjectID FROM Project WHERE Name = 'CRU-HC',
     SELECT SubprojectID FROM subproject WHERE Title = 'Disease'
    ),
    (NULL, 
     SELECT ProjectID FROM Project WHERE Name = 'CRU-ALS',
     SELECT SubprojectID FROM subproject WHERE Title = 'Control'
    ),
    (NULL, 
     SELECT ProjectID FROM Project WHERE Name = 'CRU-ALS',
     SELECT SubprojectID FROM subproject WHERE Title = 'Disease'
    ),
    (NULL, 
     SELECT ProjectID FROM Project WHERE Name = 'CRU-NM',
     SELECT SubprojectID FROM subproject WHERE Title = 'Control'
    ),
    (NULL, 
     SELECT ProjectID FROM Project WHERE Name = 'CRU-NM',
     SELECT SubprojectID FROM subproject WHERE Title = 'Disease'
    ),
    (NULL, 
     SELECT ProjectID FROM Project WHERE Name = 'CRU-PD',
     SELECT SubprojectID FROM subproject WHERE Title = 'Control'
    ),
    (NULL, 
     SELECT ProjectID FROM Project WHERE Name = 'CRU-PD',
     SELECT SubprojectID FROM subproject WHERE Title = 'Disease'
    ),
    (NULL, 
     SELECT ProjectID FROM Project WHERE Name = 'CRU-MS',
     SELECT SubprojectID FROM subproject WHERE Title = 'Control'
    ),
    (NULL, 
     SELECT ProjectID FROM Project WHERE Name = 'CRU-MS',
     SELECT SubprojectID FROM subproject WHERE Title = 'Disease'
    ),
    (NULL, 
     SELECT ProjectID FROM Project WHERE Name = 'CRU-BT',
     SELECT SubprojectID FROM subproject WHERE Title = 'Control'
    ),
    (NULL, 
     SELECT ProjectID FROM Project WHERE Name = 'CRU-BT',
     SELECT SubprojectID FROM subproject WHERE Title = 'Disease'
    ),
    (NULL, 
     SELECT ProjectID FROM Project WHERE Name = 'QPN/CORN',
     SELECT SubprojectID FROM subproject WHERE Title = 'Control'
    ),
    (NULL, 
     SELECT ProjectID FROM Project WHERE Name = 'QPN/CORN',
     SELECT SubprojectID FROM subproject WHERE Title = 'Disease'
    );

INSERT INTO `psc` (Name, Alias, MRI_Alias, Study_site) VALUES
    ('Montreal Neurological Institute', 'MNI', '', 'Y'),
	('Center Hospitalier Universitaire de Québec', 'CHUQ', '', 'Y'),
    ('Center Hospitalier Universitaire de Montréal', 'CHUM', '', 'Y'),
    ('Calgary', 'CAL', '', 'Y');

INSERT INTO `visit` (VisitName) VALUES
    ('Visit 01'),
    ('Visit 02'),
    ('Visit 03'),
    ('Visit 04');

INSERT INTO Visit_Windows (Visit_label) VALUES
    ('Visit 01'),
    ('Visit 02'),
    ('Visit 03'),
    ('Visit 04');

INSERT INTO `visit_project_subproject_rel` VALUES
    (NULL, 
	 SELECT VisitID FROM visit WHERE VisitName = 'Visit 01',
     SELECT ProjectSubprojectRelID FROM project_rel
        WHERE ProjectID = (
            SELECT ProjectID FROM Project WHERE Name = 'CRU-HC')
        AND SubprojectID = (
            SELECT SubprojectID FROM subproject WHERE Title = 'Control')
    ),
    (NULL, 
	 SELECT VisitID FROM visit WHERE VisitName = 'Visit 02',
     SELECT ProjectSubprojectRelID FROM project_rel
        WHERE ProjectID = (
            SELECT ProjectID FROM Project WHERE Name = 'CRU-HC')
        AND SubprojectID = (
            SELECT SubprojectID FROM subproject WHERE Title = 'Control')
    ),
    (NULL, 
	 SELECT VisitID FROM visit WHERE VisitName = 'Visit 01',
     SELECT ProjectSubprojectRelID FROM project_rel
        WHERE ProjectID = (
            SELECT ProjectID FROM Project WHERE Name = 'CRU-HC')
        AND SubprojectID = (
            SELECT SubprojectID FROM subproject WHERE Title = 'Disease')
    ),
    (NULL, 
	 SELECT VisitID FROM visit WHERE VisitName = 'Visit 02',
     SELECT ProjectSubprojectRelID FROM project_rel
        WHERE ProjectID = (
            SELECT ProjectID FROM Project WHERE Name = 'CRU-HC')
        AND SubprojectID = (
            SELECT SubprojectID FROM subproject WHERE Title = 'Disease')
    ),
    (NULL, 
	 SELECT VisitID FROM visit WHERE VisitName = 'Visit 01',
     SELECT ProjectSubprojectRelID FROM project_rel
        WHERE ProjectID = (
            SELECT ProjectID FROM Project WHERE Name = 'CRU-ALS')
        AND SubprojectID = (
            SELECT SubprojectID FROM subproject WHERE Title = 'Control')
    ),
    (NULL, 
	 SELECT VisitID FROM visit WHERE VisitName = 'Visit 02',
     SELECT ProjectSubprojectRelID FROM project_rel
        WHERE ProjectID = (
            SELECT ProjectID FROM Project WHERE Name = 'CRU-ALS')
        AND SubprojectID = (
            SELECT SubprojectID FROM subproject WHERE Title = 'Control')
    ),
    (NULL, 
	 SELECT VisitID FROM visit WHERE VisitName = 'Visit 01',
     SELECT ProjectSubprojectRelID FROM project_rel
        WHERE ProjectID = (
            SELECT ProjectID FROM Project WHERE Name = 'CRU-ALS')
        AND SubprojectID = (
            SELECT SubprojectID FROM subproject WHERE Title = 'Disease')
    ),
    (NULL, 
	 SELECT VisitID FROM visit WHERE VisitName = 'Visit 02',
     SELECT ProjectSubprojectRelID FROM project_rel
        WHERE ProjectID = (
            SELECT ProjectID FROM Project WHERE Name = 'CRU-ALS')
        AND SubprojectID = (
            SELECT SubprojectID FROM subproject WHERE Title = 'Disease')
    ),
    (NULL, 
	 SELECT VisitID FROM visit WHERE VisitName = 'Visit 01',
     SELECT ProjectSubprojectRelID FROM project_rel
        WHERE ProjectID = (
            SELECT ProjectID FROM Project WHERE Name = 'CRU-NM')
        AND SubprojectID = (
            SELECT SubprojectID FROM subproject WHERE Title = 'Control')
    ),
    (NULL, 
	 SELECT VisitID FROM visit WHERE VisitName = 'Visit 02',
     SELECT ProjectSubprojectRelID FROM project_rel
        WHERE ProjectID = (
            SELECT ProjectID FROM Project WHERE Name = 'CRU-NM')
        AND SubprojectID = (
            SELECT SubprojectID FROM subproject WHERE Title = 'Control')
    ),
    (NULL, 
	 SELECT VisitID FROM visit WHERE VisitName = 'Visit 01',
     SELECT ProjectSubprojectRelID FROM project_rel
        WHERE ProjectID = (
            SELECT ProjectID FROM Project WHERE Name = 'CRU-NM')
        AND SubprojectID = (
            SELECT SubprojectID FROM subproject WHERE Title = 'Disease')
    ),
    (NULL, 
	 SELECT VisitID FROM visit WHERE VisitName = 'Visit 02',
     SELECT ProjectSubprojectRelID FROM project_rel
        WHERE ProjectID = (
            SELECT ProjectID FROM Project WHERE Name = 'CRU-NM')
        AND SubprojectID = (
            SELECT SubprojectID FROM subproject WHERE Title = 'Disease')
    ),
    (NULL, 
	 SELECT VisitID FROM visit WHERE VisitName = 'Visit 01',
     SELECT ProjectSubprojectRelID FROM project_rel
        WHERE ProjectID = (
            SELECT ProjectID FROM Project WHERE Name = 'CRU-PD')
        AND SubprojectID = (
            SELECT SubprojectID FROM subproject WHERE Title = 'Control')
    ),
    (NULL, 
	 SELECT VisitID FROM visit WHERE VisitName = 'Visit 02',
     SELECT ProjectSubprojectRelID FROM project_rel
        WHERE ProjectID = (
            SELECT ProjectID FROM Project WHERE Name = 'CRU-PD')
        AND SubprojectID = (
            SELECT SubprojectID FROM subproject WHERE Title = 'Control')
    ),
    (NULL, 
	 SELECT VisitID FROM visit WHERE VisitName = 'Visit 01',
     SELECT ProjectSubprojectRelID FROM project_rel
        WHERE ProjectID = (
            SELECT ProjectID FROM Project WHERE Name = 'CRU-PD')
        AND SubprojectID = (
            SELECT SubprojectID FROM subproject WHERE Title = 'Disease')
    ),
    (NULL, 
	 SELECT VisitID FROM visit WHERE VisitName = 'Visit 02',
     SELECT ProjectSubprojectRelID FROM project_rel
        WHERE ProjectID = (
            SELECT ProjectID FROM Project WHERE Name = 'CRU-PD')
        AND SubprojectID = (
            SELECT SubprojectID FROM subproject WHERE Title = 'Disease')
    ),
    (NULL, 
	 SELECT VisitID FROM visit WHERE VisitName = 'Visit 01',
     SELECT ProjectSubprojectRelID FROM project_rel
        WHERE ProjectID = (
            SELECT ProjectID FROM Project WHERE Name = 'CRU-MS')
        AND SubprojectID = (
            SELECT SubprojectID FROM subproject WHERE Title = 'Control')
    ),
    (NULL, 
	 SELECT VisitID FROM visit WHERE VisitName = 'Visit 02',
     SELECT ProjectSubprojectRelID FROM project_rel
        WHERE ProjectID = (
            SELECT ProjectID FROM Project WHERE Name = 'CRU-MS')
        AND SubprojectID = (
            SELECT SubprojectID FROM subproject WHERE Title = 'Control')
    ),
    (NULL, 
	 SELECT VisitID FROM visit WHERE VisitName = 'Visit 01',
     SELECT ProjectSubprojectRelID FROM project_rel
        WHERE ProjectID = (
            SELECT ProjectID FROM Project WHERE Name = 'CRU-MS')
        AND SubprojectID = (
            SELECT SubprojectID FROM subproject WHERE Title = 'Disease')
    ),
    (NULL, 
	 SELECT VisitID FROM visit WHERE VisitName = 'Visit 02',
     SELECT ProjectSubprojectRelID FROM project_rel
        WHERE ProjectID = (
            SELECT ProjectID FROM Project WHERE Name = 'CRU-MS')
        AND SubprojectID = (
            SELECT SubprojectID FROM subproject WHERE Title = 'Disease')
    ),
    (NULL, 
	 SELECT VisitID FROM visit WHERE VisitName = 'Visit 01',
     SELECT ProjectSubprojectRelID FROM project_rel
        WHERE ProjectID = (
            SELECT ProjectID FROM Project WHERE Name = 'CRU-BT')
        AND SubprojectID = (
            SELECT SubprojectID FROM subproject WHERE Title = 'Control')
    ),
    (NULL, 
	 SELECT VisitID FROM visit WHERE VisitName = 'Visit 02',
     SELECT ProjectSubprojectRelID FROM project_rel
        WHERE ProjectID = (
            SELECT ProjectID FROM Project WHERE Name = 'CRU-BT')
        AND SubprojectID = (
            SELECT SubprojectID FROM subproject WHERE Title = 'Control')
    ),
    (NULL, 
	 SELECT VisitID FROM visit WHERE VisitName = 'Visit 01',
     SELECT ProjectSubprojectRelID FROM project_rel
        WHERE ProjectID = (
            SELECT ProjectID FROM Project WHERE Name = 'CRU-BT')
        AND SubprojectID = (
            SELECT SubprojectID FROM subproject WHERE Title = 'Disease')
    ),
    (NULL, 
	 SELECT VisitID FROM visit WHERE VisitName = 'Visit 02',
     SELECT ProjectSubprojectRelID FROM project_rel
        WHERE ProjectID = (
            SELECT ProjectID FROM Project WHERE Name = 'CRU-BT')
        AND SubprojectID = (
            SELECT SubprojectID FROM subproject WHERE Title = 'Disease')
    ),
    (NULL, 
	 SELECT VisitID FROM visit WHERE VisitName = 'Visit 01',
     SELECT ProjectSubprojectRelID FROM project_rel
        WHERE ProjectID = (
            SELECT ProjectID FROM Project WHERE Name = 'QPN/CORN')
        AND SubprojectID = (
            SELECT SubprojectID FROM subproject WHERE Title = 'Control')
    ),
    (NULL, 
	 SELECT VisitID FROM visit WHERE VisitName = 'Visit 02',
     SELECT ProjectSubprojectRelID FROM project_rel
        WHERE ProjectID = (
            SELECT ProjectID FROM Project WHERE Name = 'QPN/CORN')
        AND SubprojectID = (
            SELECT SubprojectID FROM subproject WHERE Title = 'Control')
    ),
    (NULL, 
	 SELECT VisitID FROM visit WHERE VisitName = 'Visit 01',
     SELECT ProjectSubprojectRelID FROM project_rel
        WHERE ProjectID = (
            SELECT ProjectID FROM Project WHERE Name = 'QPN/CORN')
        AND SubprojectID = (
            SELECT SubprojectID FROM subproject WHERE Title = 'Disease')
    ),
    (NULL, 
	 SELECT VisitID FROM visit WHERE VisitName = 'Visit 02',
     SELECT ProjectSubprojectRelID FROM project_rel
        WHERE ProjectID = (
            SELECT ProjectID FROM Project WHERE Name = 'QPN/CORN')
        AND SubprojectID = (
            SELECT SubprojectID FROM subproject WHERE Title = 'Disease')
    );

--INSERT INTO `consent` (Name, Label) VALUES
--    ('***', '****');

