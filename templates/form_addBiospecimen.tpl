<script type="text/javascript" src="{$baseurl}/js/invalid_form_scroll.js"></script>
<script type="text/javascript" src="{$baseurl}/js/.js"></script>
<script type="text/javascript" src="{$baseurl}/js/biobanking_helper.js"></script>

<script>
//DATE PICKER GUI
    $(function(){
        $('input[name=collection_date_iswab]').datepicker({
  			yearRange: 'c-70:c+10',
            dateFormat: 'd-M-yy',
            changeMonth: true,
            changeYear: true,
            gotoCurrent: true
        });
});

//DATE PICKER GUI FOR CONSENT DATE
$(function(){
    $('input[name=consent_date]').datepicker({
        yearRange: 'c-70:c+10',
        dateFormat: 'd-M-yy',
        changeMonth: true,
        changeYear: true,
    });
});

//DOES NOT ALLOW FORM TO BE SAVED IF CONSENT IS NOT GIVEN
function consentRequired() {
    var x = document.getElementsByName("participant_consent")[0];
    if (x.value == "Yes") {
        $("#save").prop("disabled", false);
        $("#consent_alert").hide();
    }
    if (x.value != "Yes") {
        $("#save").prop("disabled", true);
        $("#consent_alert").show();
    }
}

//ENABLES FORM WHEN SAMPLE NUMBER IS SET TO 1, DISABLES WHEN SET TO 0
function sampleRequired(specimenType, fieldNames) {
    var fieldNames = [
        "biospecimen_id_", "status_id_", "collection_date_", "collection_ra_id_",
        "time_", "freezer_id_", "box_id_", "box_coordinates_", "collection_notes_"]
    var fieldNamesLength = fieldNames.length;

        var x = document.getElementsByName("nb_samples_" + specimenType)[0];

        for (var i = 0; i < fieldNamesLength; i++) {
            if (x.value == "1") {
                $(document.getElementsByName(fieldNames[i] + specimenType)[0]).prop("disabled", false);
            }
            if (x.value == "0") {
                $(document.getElementsByName(fieldNames[i] + specimenType)[0]).prop("disabled", true);
            }
        }

}
</script>

{*ERROR ALERT*}
<form method="post" name="edit_biospecimen">
    {if $form.errors}
    <div class="alert alert-danger" role="alert">
        The form you submitted contains data entry errors:
   	    {foreach from=$form.errors item=error key=k}
   	        {if $k eq 'collection_date'}
	        <br>&nbsp;<b>Collection Date</b>: {$error}
	        {else}
	        <br>&nbsp;<b>{$k}</b>: {$error}
	        {/if}
        {/foreach}
    </div>
    {/if}

    {*FORM HEADER*}
    <div class="panel panel-default">

        {*FORM GLOBALS*}
        <div class="panel-heading" id="panel-main-heading">
            <p>Edit Collection Data for Biospecimens{$biospecimenId}</p>
        </div> <!-- closing panel-heading div-->

        <div class="panel-body" id="panel-main-body">

            {*Zepsom Id*}
            <div class="col-xs-2">
                <td>{$form.zepsom_id.label}</td>
                <td id="zepsom_id">{$form.zepsom_id.html}</td>
            </div>

            {*PSCID*}
            <div class="col-xs-2">
                <td>{$form.pscid.label}</td>
                <td>{$form.pscid.html}</td>
            </div>

            {*Date of Birth*}
            <div class="col-xs-2">
                <td>{$form.dob.label}</td>
                <td>{$form.dob.html}</td>
            </div>

            {*Participant Consent*}
            <div class="col-xs-2">
                <td>{$form.participant_consent.label}</td>
                <td>{$form.participant_consent.html}</td>
            </div>

            {*Consent Date*}
            <div class="col-xs-2">
                {if $form.errors.consent_date}
                    <td class="col-xs-2"><font color="red">{$form.consent_date.label}</font></td>
                {else}
                    <td class="col-xs-2">{$form.consent_date.label}</td>
                {/if}
                <td>{$form.consent_date.html}</td>
            </div>


        </div>


        {*Form Groups*}
        <div class="panel-body" id="panel-main-body">

            {*Sample Type*}
            <div class="row form-group form-inline">
                <label class="col-xs-2">
                    {$form.type_id_group.label}
                </label>
                {$form.type_id_group.html}
                {if $form.errors.type_id_group}
                    <div class="col-xs-offset-2 col-xs-12">
                        <font class="form-error">{$form.errors.type_id_group}</font>
                    </div>
                {/if}
            </div>

            {*Number of Samples*}
            <div class="row form-group form-inline">
                <label class="col-xs-2">
                    {$form.nb_samples_group.label}
                </label>
                {$form.nb_samples_group.html}
                {if $form.errors.nb_samples_group}
                    <div class="col-xs-offset-2 col-xs-12">
                        <font class="form-error">{$form.errors.nb_samples_group}</font>
                    </div>
                {/if}
            </div>

            {*Biospecimen ID*}
            <div class="row form-group form-inline">
                <label class="col-xs-2">
                    {$form.biospecimen_id_group.label}
                </label>
                {$form.biospecimen_id_group.html}
                {if $form.errors.biospecimen_id_group}
                    <div class="col-xs-offset-2 col-xs-12">
                        <font class="form-error">{$form.errors.biospecimen_id_group}</font>
                    </div>
                {/if}
            </div>

            {*Sample Status*}
            <div class="row form-group form-inline">
                <label class="col-xs-2">
                    {$form.status_id_group.label}
                </label>
                {$form.status_id_group.html}
                {if $form.errors.status_id_group}
                    <div class="col-xs-offset-2 col-xs-12">
                        <font class="form-error">{$form.errors.status_id_group}</font>
                    </div>
                {/if}
            </div>

            {*Collection Date*}
            <div class="row form-group form-inline">
                <label class="col-xs-2">
                    {$form.collection_date_group.label}
                </label>
                {$form.collection_date_group.html}
                {if $form.errors.collection_date_group}
                    <div class="col-xs-offset-2 col-xs-12">
                        <font class="form-error">{$form.errors.collection_date_group}</font>
                    </div>
                {/if}
            </div>

            {*Collection RA*}
            <div class="row form-group form-inline">
                <label class="col-xs-2">
                    {$form.collection_ra_id_group.label}
                </label>
                {$form.collection_ra_id_group.html}
                {if $form.errors.collection_ra_id_group}
                    <div class="col-xs-offset-2 col-xs-12">
                        <font class="form-error">{$form.errors.collection_ra_id_group}</font>
                    </div>
                {/if}
            </div>

            {*Collection Time*}
            <div class="row form-group form-inline">
                <label class="col-xs-2">
                    {$form.time_group.label}
                </label>
                {$form.time_group.html}
                {if $form.errors.time_group}
                    <div class="col-xs-offset-2 col-xs-12">
                        <font class="form-error">{$form.errors.time_group}</font>
                    </div>
                {/if}
            </div>

            {*Freezer ID*}
            <div class="row form-group form-inline">
                <label class="col-xs-2">
                    {$form.freezer_id_group.label}
                </label>
                {$form.freezer_id_group.html}
                {if $form.errors.freezer_id_group}
                    <div class="col-xs-offset-2 col-xs-12">
                        <font class="form-error">{$form.errors.freezer_id_group}</font>
                    </div>
                {/if}
            </div>

            {*Box ID*}
            <div class="row form-group form-inline">
                <label class="col-xs-2">
                    {$form.box_id_group.label}
                </label>
                {$form.box_id_group.html}
                {if $form.errors.box_id_group}
                    <div class="col-xs-offset-2 col-xs-12">
                        <font class="form-error">{$form.errors.box_id_group}</font>
                    </div>
                {/if}
            </div>

            {*Box Coordinates*}
            <div class="row form-group form-inline form-inline">
                <label class="col-xs-2">
                    {$form.box_coordinates_group.label}
                </label>
                {$form.box_coordinates_group.html}
                {if $form.errors.box_coordinates_group}
                    <div class="col-xs-offset-2 col-xs-12">
                        <font class="form-error">{$form.errors.box_coordinates_group}</font>
                    </div>
                {/if}
            </div>

            {*Collection Notes*}
            <div class="row form-group form-inline form-inline">
                <label class="col-xs-2">
                    {$form.collection_notes_group.label}
                </label>
                {$form.collection_notes_group.html}
                {if $form.errors.collection_notes_group}
                    <div class="col-xs-offset-2 col-xs-12">
                        <font class="form-error">{$form.errors.collection_notes_group}</font>
                    </div>
                {/if}
            </div>

            {*CONSENT REQUIRED ALERT*}
            <div id="consent_alert"><font color="red"> Consent must be given in order to submit this form.</font></div>

            {*SAVE, RESET and BACK BUTTONS*}
            <div class="row form-group form-inline">
                <div class="col-sm-2">
                    <input id="save" class="btn btn-sm btn-primary col-xs-12" name="fire_away" value="Save" type="submit" disabled />
                </div>
                <div class="col-sm-2">
                    <input class="btn btn-sm btn-primary col-xs-12" value="Reset" type="reset" />
                </div>
                <div class="col-sm-2">
                    <input class="btn btn-sm btn-primary col-xs-12" onclick="location.href='{$baseurl}/biobanking/?submenu=biospecimen_collection&biospecimen_id={$biospecimenId}'" value="Back" type="button" />
                </div>
            </div>



</form>
