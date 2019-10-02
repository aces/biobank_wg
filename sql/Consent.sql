/* Drop Consent table*/
DROP TABLE IF EXISTS `consent`;

/* Add consent table */
CREATE TABLE `consent` (
  `ConsentID` integer unsigned NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  `Label` varchar(255) NOT NULL,
  CONSTRAINT `PK_consent` PRIMARY KEY (`ConsentID`),
  CONSTRAINT `UK_consent_Name` UNIQUE KEY `Name` (`Name`),
  CONSTRAINT `UK_consent_Label` UNIQUE KEY `Label` (`Label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/* Adds consent form to database */
INSERT INTO consent (Name, Label) VALUES ('IRB', 'Re-consented for latest version');
INSERT INTO consent (Name, Label) VALUES ('INF', 'I agree to be contacted by e-mail for follow-up information on C-BIG (otherwise information will be made available on the C-BIG website)');
INSERT INTO consent (Name, Label) VALUES ('HR', 'I agree for the clinical research co-coordinators to access my dossier de sante du Quebec or institutional clinical repository to obtain clinical, laboratory, and radiological data relevant for C-BIG periodically and/or as needed');
INSERT INTO consent (Name, Label) VALUES ('GEN', 'I agree that my samples be used to extract DNA, RNA and micro-RNA');
INSERT INTO consent (Name, Label) VALUES ('CL', 'I agree that my sample be used to generate cell lines');
INSERT INTO consent (Name, Label) VALUES ('CQ', 'I agree to be re-contacted to complete additional questionnaires about my health and quality of life');
INSERT INTO consent (Name, Label) VALUES ('CS', 'I agree to be re-contacted for additional sampling (blood, skin and muscle biopsy)');
INSERT INTO consent (Name, Label) VALUES ('CR', 'I agree to be re-contacted for future specific research projects if deemed warranted by the projects principal investigator / clinician');
INSERT INTO consent (Name, Label) VALUES ('LP', 'I consent to participate to undergo an LP for the purpose of C-BIG in accordance with the conditions stated.');
INSERT INTO consent (Name, Label) VALUES ('LPMB', 'I consent to participate to undergo a muscle biopsy for the purpose of C-BIG in accordance with the conditions stated.');
INSERT INTO consent (Name, Label) VALUES ('LPSB', 'I consent to participate to undergo a skin biopsy for the purpose of C-BIG in accordance with the conditions stated.');
