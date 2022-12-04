<h1><i class="fa {faIcon}"></i> Email Blacklist</h1>

<style>
.{nbbId}-settings .checkbox>label {
  font-size: 20px;
}
.{nbbId}-settings .checkbox>label>input {
  margin-bottom: -1px;
}
</style>
<form role="form" class="{nbbId}-settings">
    <fieldset>
        <div class="form-group">
            <textarea class="form-control" rows="6" id="domains" name="domains" placeholder="Enter email domains (one per line) blacklist"></textarea>
            <textarea class="form-control" rows="6" id="domainswhite" name="domainswhite" placeholder="Enter email domains whitelist (one per line)"></textarea>
        </div>
        <!-- <div class="checkbox"><label><input type="checkbox" id="isTempMailEnabled" name="isTempMailEnabled"/> Enable isTempMail API check</label></div> -->
        <button class="btn btn-lg btn-primary" id="save" type="button">Save</button>
    </fieldset>
</form>