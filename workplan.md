# Zepsom project – work plan (June 26th-July 7th)

The goal for the 2 following weeks will be to make the data entry portion of the project as close as possible to what it is going to look like in the final product. Keep in mind that there will be a LORIS user’s manual that we will hand out to the nurses that will perform data entry and this manual has to be ready (screen shots and everything...) on Wednesday July 12th.

The biobanking data entry form can be accessed by clicking on the ‘Add Specimen’ tab on the initial screen you see when you access the biobanking module in ‘Tools’. 

Here’s the list of things to do:

1. ~~Add a side bar on the left that will list all the specimen types: iSwab, EDTA, Paxgene and Oragene. Just like for CCNA, each link allows the user to enter data for a given specimen type. For all types, the data entry fields displayed on the form will be the same.~~
2. ~~Biospecimen ID: keep this line.~~ Maybe rename to Bar Code? Check with Kieran/Adriana. ~~This line is editable.~~
3. ~~PSCID: keep this line.~~ Maybe rename to ‘PSCID/Zepsom-bio ID’. ~~This field should be non-editable. The candidate is actually selected using the external ID (see below).~~
4. ~~Add a line under ‘PSCID’ for the external ID (the ID of all candidate on the existing Zepsom system, which is not under our control). I was given the list of all these Ids and filled the candidate table with them. Consequently, all candidates have a CandID, a PSCID (which is really the Zepsom-bio ID) and an external ID (which is the Zepsom ID).~~ This field is editable and should be a searchable dropdown. Upon entry, it would be nice if the PSCID field would be automtically updated with the corresponding value.
5. ~~Add a line that reads ‘Consent Given?’. Editable field. Should be a drop down with no default value. Possible values: yes and no. The form cannot be saved if this field is not set.~~ When the form is saved, the appropriate database tables from the Consent module should be updated to reflect the value selected. This might look a bit redundant at first but it will greatly simplify the data entry workflow for the nurses. The Consent module will still be available to edit/enter consent information though.
6. ~~Participant Type: remove this line~~
7. ~~Date of birth: starts empty~~ but will be updated when a value is entered/selected in 4.
8. ~~Sample Type: leave as is. Non editable and automtically set based on whatever was selected in the side bar.~~
9. ~~Number of samples: leave as is. Non-editable and automatically set to 1.~~
10. ~~Sample status. Leave as is. Non editable and automatically set to ‘Available’.~~
11. ~~Date of collection. Editable via a calendar-like UI. By default, it is set to today’s date. Use jQuery’s calendar widget and format ‘13-Aug-2013’ (see actual code).~~
12. ~~Collection RA. Set to the UserID of the user currently logged in. Note that all the users that can perform bio-data entry should exist in table ‘biobanking_ra’.~~
13. ~~Time. Leave as is. Initially blank.~~
14. ~~Woke. Delete this line.~~
15. ~~Freezer. Leave as is. Editable Drop-down. Here’s the freezers list:
4 degrees C fridge in room E-3304.10: XM-02
-20 degrees C fridge in room E-3304.10: XM-01
-80 degrees C fridge in Lehman pavillion near room G-1116: MM15~~
16. ~~Bag Name: remove line.~~
17. ~~Buccal Rack ID: remove line.~~
18. ~~Buccal Rack Coordinates: remove line.~~
19. ~~Shelf#: remove line.~~
20. ~~-Rack#: remove line.-~~
21. ~~Box Name: change to Box ID. Editable. Should be a drop-down.~~ See Kieran/Adriana as the possible values are not yet known.
22. ~~Box Coordinates: leave as is. Editable. Should be a text field.~~ See Kieran/Adriana as the possible values are not yet known.
23. ~~Oragene Location: delete line.~~
24. ~~Collection Notes. Leave as is.~~


