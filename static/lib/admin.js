'use strict';

define('admin/plugins/email-blacklist', [
	'settings', 'alerts',
], function (settings, alerts) {
	var ACP = {};

	ACP.init = function () {
		settings.load('email-blacklist', $('.email-blacklist-settings'));
		$('#save').on('click', saveSettings);
	};

	function saveSettings() {
		settings.save('email-blacklist', $('.email-blacklist-settings'), function () {
			alerts.alert({
				type: 'success',
				alert_id: 'email-blacklist-saved',
				title: 'Settings Saved',
				message: 'Please reload your NodeBB to apply these settings',
				clickfn: function () {
					socket.emit('admin.reload');
				},
			});
		});
	}

	return ACP;
});
