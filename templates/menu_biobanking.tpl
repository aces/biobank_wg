<!-- TODO: move this into javascript files? -->
{literal}
<script type="text/javascript">
    $(document).ready(function(){
        $("#cand").DynamicTable({ "freezeColumn" : "pscid" });

        $('input[name=dob_1]').datepicker({
  			yearRange: 'c-70:c',
            dateFormat: 'dd-M-yy',
            changeMonth: true,
            changeYear: true
        });
	});
</script>
{/literal}
<script type="text/javascript" src="{$baseurl}/js/advancedMenu.js"></script>

<script type="text/javascript">
	function validateForm() {
		var pscids = $("textarea[name='pscId_1']").val();
		if(!pscids.match(/^\s*([\w-]+)?(\s+[\w-]+)*\s*$/)) {
			document.getElementById('error_message').innerHTML =
			    '<font color="red">&nbsp;&nbsp;&nbsp;Invalid PSCIDs. Please enter a list of pscids separated by spaces or leave this field blank</font>';
			return false;
		}

		var dob = $("input[name='dob_1']").val();
		if(!dob.match(/^\s*$/)
		   && !dob.match(/^\s*(\d|\d\d)-(Jan|Feb|Mar|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d\d\d\d\s*$/i)) {
			document.getElementById('error_message').innerHTML =
			    '<font color="red">&nbsp;&nbsp;&nbsp;The Date of  birth should be in the form "dd-AbbreviatedMonth-YYYY" (e.g 03-Jul-2011, 11-Nov-2013, etc...)</font>';
			return false;
		}

		document.getElementById('error_message').innerHTML = '';
		return true;
	}
</script>

</script>

<div class="row">
    <div id="tabs">
        <ul class="nav nav-tabs">
            <li class="statsTab active"><a class="statsTabLink" id="onLoad"><strong>Search by PSCID</strong></a></li>
            <li class="statsTab"><a class="statsTabLink" href="{$baseurl}/biobanking/?submenu=biospecimen_search&reset=true">Search by Specimen</a></li>
            <li class="statsTab"><a class="statsTabLink" href="{$baseurl}/biobanking/?submenu=addBiospecimen">Add Specimen</a></li>
        </ul>
        <br>
    </div>
</div>

<div class="row">
<div class="col-sm-12">
<div class="panel panel-primary">
    <div class="panel-heading" onclick="hideFilter(this)">
        Selection Filter
        <!--Note: this label is currently hidden (display:none) -->
        <label class="advancedOptions" id="advanced-label" style="display:none">(Advanced Options)</label>
        <span class="glyphicon arrow glyphicon-chevron-up pull-right"></span>
    </div>
    <div class="panel-body">
        <form method="post" action="{$baseurl}/biobanking/">
			<div class="row">
                    &nbsp;&nbsp;&nbsp;&nbsp;<label id="error_message"></label>
            </div>
            <br>
            <div class="row">
                <div class="form-group col-sm-4">
                    <label class="col-sm-5 col-md-5">
                        {$form.pscId_1.label}
                    </label>
                    <div class="col-sm-4 col-md-7">
                        {$form.pscId_1.html}
                    </div>
                </div>
                <div class="form-group col-sm-4">
                    <label class="col-sm-5 col-md-5">
                        {$form.dob_1.label}
                    </label>
                    <div class="col-sm-4 col-md-7">
                        {$form.dob_1.html}
                    </div>
                </div>
                <div class="form-group col-sm-4">
                    <label class="col-sm-5 col-md-5">
                        {$form.participantType_1.label}
                    </label>
                    <div class="col-sm-4 col-md-7">
                        {$form.participantType_1.html}
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="form-group col-sm-4">
                    <label class="col-sm-5 col-md-5">
                        {$form.buccalSample_1.label}
                    </label>
                    <div class="col-sm-8 col-md-7">
                        {$form.buccalSample_1.html}
                    </div>
                </div>
                <div class="form-group col-sm-4">
                    <label class="col-sm-5 col-md-5">
                        {$form.orageneSample_1.label}
                    </label>
                    <div class="col-sm-4 col-md-7">
                        {$form.orageneSample_1.html}
                    </div>
                </div>
                <div class="form-group col-sm-4">
                    <label class="col-sm-5 col-md-5">
                        {$form.salivaSample_1.label}
                    </label>
                    <div class="col-sm-4 col-md-7">
                        {$form.salivaSample_1.html}
                    </div>
                </div>
           </div> <!-- End second row -->
            <div class="row">
                <div class="form-group col-sm-4">
                    <label class="col-sm-5 col-md-5">
                        {$form.bloodDnaSample_1.label}
                    </label>
                    <div class="col-sm-4 col-md-7">
                        {$form.bloodDnaSample_1.html}
                    </div>
                </div>
                <div class="form-group col-sm-4">
                    <label class="col-sm-5 col-md-5">
                        {$form.bloodRnaSample_1.label}
                    </label>
                    <div class="col-sm-4 col-md-7">
                        {$form.bloodRnaSample_1.html}
                    </div>
                </div>
                <div class="form-group col-sm-4">
                    <label class="col-sm-5 col-md-5">
                        {$form.data_1.label}
                    </label>
                    <div class="col-sm-4 col-md-7">
                        {$form.data_1.html}
                    </div>
                </div>
            </div> <!-- End third row -->
            {if $form.project_1}
            <div class="row">
                <div class="form-group col-sm-4">
                    <label class="col-sm-5 col-md-5">
                        {$form.project_1.label}
                    </label>
                    <div class="col-sm-4 col-md-7">
                        {$form.project_1.html}
                    </div>
                </div>
            </div> <!-- End fourth row -->
            {/if}

            <!-- Note: this is currently hidden -->
            <div class="advancedOptions" id="advanced-options" style="display:none">
                <div class="row">
                    <div class="form-group col-sm-4">
                       <label class="col-sm-12 col-md-4">
                        {$form.parent_id.label}
                    </label>
                    <div class="col-sm-12 col-md-8">
                        {$form.parent_id.html}
                    </div>
                  </div>
                    <div class="form-group col-sm-4">
                        <label class="col-sm-12 col-md-4">
                            {$form.Participant_Status.label}
                        </label>
                        <div class="col-sm-12 col-md-8">
                            {$form.Participant_Status.html}
                        </div>
                    </div>
                    <div class="form-group col-sm-4">
                        <label class="col-sm-12 col-md-4">
                            {$form.exp_date.label}
                        </label>
                        <div class="col-sm-12 col-md-8">
                            {$form.exp_date.html}
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="form-group col-sm-4">
                        <label class="col-sm-12 col-md-4">
                            {$form.gender.label}
                        </label>
                        <div class="col-sm-12 col-md-8">
                            {$form.gender.html}
                        </div>
                    </div>
                    <div class="form-group col-sm-4">
                        <label class="col-sm-12 col-md-4">
                            {$form.Visit_Count.label}
                        </label>
                        <div class="col-sm-12 col-md-8">
                            {$form.Visit_Count.html}
                        </div>
                    </div>
                    <div class="form-group col-sm-4">
                        <label class="col-sm-12 col-md-4">
                            {$form.edc.label}
                        </label>
                        <div class="col-sm-12 col-md-8">
                            {$form.edc.html}
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="form-group col-sm-4">
                        <label class="col-sm-12 col-md-4">
                            {$form.Latest_Visit_Status.label}
                        </label>
                        <div class="col-sm-12 col-md-8">
                            {$form.Latest_Visit_Status.html}
                        </div>
                    </div>
                    <div class="form-group col-sm-4">
                        <label class="col-sm-12 col-md-4">
                            &nbsp;
                        </label>
                        <div class="col-sm-12 col-md-8">
                            &nbsp;
                        </div>
                    </div>
                    <div class="form-group col-sm-4">
                        <label class="col-sm-12 col-md-4">
                            {$form.Feedback.label}
                        </label>
                        <div class="col-sm-12 col-md-8">
                            {$form.Feedback.html}
                        </div>
                    </div>
                </div>
            </div>
            <br class="visible-xs">
            <div id="advanced-buttons">
                <!-- <div class="form-group col-sm-6 col-sm-offset-6"> -->
                        <!-- <div class="col-sm-6"> -->
                            <div class="col-sm-4 col-md-3 col-xs-12 col-md-offset-3">
                                <input type="submit" name="filter" value="Apply Filters" id="showdata_advanced_options" class="btn btn-sm btn-primary col-xs-12" onClick="return validateForm();"/>
                            </div>

                            <div class="visible-xs col-xs-12"> </div>
                            <div class="visible-xs col-xs-12"> </div>
                            <div class="visible-xs col-xs-12"> </div>
                            <div class="visible-xs col-xs-12"> </div>
                            <div class="col-sm-4 col-md-3 col-xs-12">
                                <input type="button" name="reset" value="Clear Active Filters" class="btn btn-sm btn-primary col-xs-12" onclick="location.href='{$baseurl}/main.php?test_name=biobanking&reset=true'" />
                            </div>
                            <div class="visible-xs col-xs-12"> </div>
                            <div class="visible-xs col-xs-12"> </div>
                            <div class="visible-xs col-xs-12"> </div>
                            <div class="visible-xs col-xs-12"> </div>
                        <!-- </div> -->
                    <!-- </div> -->
            </div>
        </form>
    </div>
</div>
</div>
<!-- TODO: Is this necessary? Should be biobanking always....?? -->
{if not $biobanking}
<div class="col-sm-3">
    <div class="panel panel-primary">
    <div class="panel-heading" onclick="hideFilter(this)">
        Open Profile
        <span class="glyphicon arrow glyphicon-chevron-up pull-right"></span>
    </div>
    <div class="panel-body" id="panel-body">
    <form class="form-horizontal" id="biobankingForm" name="biobankingForm" method="get" action="main.php">
        <input type="hidden" name="test_name" value="timepoint_list">
        <div class="form-group col-sm-12">
            <label class="col-sm-12 col-md-4">
                {$form.candID.label}
            </label>
            <div class="col-sm-12 col-md-8">
                {$form.candID.html}
            </div>
        </div>
        <div class="form-group col-sm-12">
            <label class="col-sm-12 col-md-4">
                 {$form.PSCID.label}
            </label>
            <div class="col-sm-12 col-md-8">
                 {$form.PSCID.html}
            </div>
        </div>
        <input type="submit" value="Open Profile" class="btn btn-sm btn-primary col-md-5 col-sm-12 col-md-offset-5">
    </form>
   </div>
</div> <!--closing col-sm-3 tag -->
</div>
{/if}
</div>


<div id="datatable" />
<script>
var table = RDynamicDataTable({
    "DataURL" : "{$baseurl}/biobanking/?format=json",
    "getFormattedCell" : formatColumn,
    "freezeColumn" : "subject_id"
});

React.render(table, document.getElementById("datatable"));
</script>
