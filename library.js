var https = require('https');
var pluginData = require('./plugin.json');
var winston = module.parent.require('winston');
var meta = require.main.require('./src/meta');
var pluginSettings;
var Plugin = {};

pluginData.nbbId = pluginData.id.replace(/nodebb-plugin-/, '');

Plugin.load = function (params, callback) {

    var render = function (req, res, next) {
        res.render('admin/plugins/' + pluginData.nbbId, pluginData || {});
    };

    meta.settings.get(pluginData.nbbId, function (err, settings) {
        if (err)
            return callback(err);
        if (!settings) {
            winston.warn('[plugins/' + pluginData.nbbId + '] Settings not set or could not be retrieved!');
            return callback();
        }

        winston.info('[plugins/' + pluginData.nbbId + '] Settings loaded');
        pluginSettings = settings;

        params.router.get('/admin/plugins/' + pluginData.nbbId, params.middleware.admin.buildHeader, render);
        params.router.get('/api/admin/plugins/' + pluginData.nbbId, render);

        callback();
    });
};

Plugin.onEmailSave = async (data) => {
    if (isBlacklistedDomain(data.email)) {
        throw new Error('Blacklisted email provider.');
    }
    if (!isWhitelistedDomain(data.email)) {
        throw new Error('Not whitelisted email provider.')
    }

    if (pluginSettings.isTempMailEnabled === 'on' && !await isTempMail(data.email)) {
        throw new Error('Blacklisted email provider.');
    }

    return data;
};

// Plugin.filterEmailRegister = function (regData, next) {
//     if (regData && regData.userData && regData.userData.email) {
//         if (isBlacklistedDomain(regData.userData.email))
//             return next(new Error('Blacklisted email provider.'));
//         if (pluginSettings.isTempMailEnabled === 'on')
//             return isTempMail(regData.userData.email, regData, next);
//     }
//     return next(null, regData);
// };

Plugin.filterEmailUpdate = function (data, next) {
    if (data && data.email) {
        if (isBlacklistedDomain(data.email))
            return next(new Error('Blacklisted email provider.'));
        if (!isWhitelistedDomain(data.email))
            return next(new Error('Not whitelisted email provider.'));
        if (pluginSettings.isTempMailEnabled === 'on')
            return isTempMail(data.email, data, next);
    }
    return next(null, data);
};

function isBlacklistedDomain(email) {
    var domain = email.substring(email.indexOf('@') + 1);
    var lines = pluginSettings.domains.split('\n');
    for (var i = 0; i < lines.length; i++)
        if (domain === lines[i].trim())
            return true;
    return false;
}

function isWhitelistedDomain(email) {
    var domain = email.substring(email.indexOf('@') + 1);
    var lines = pluginSettings.domainswhite.split('\n');
    for (var i = 0; i < lines.length; i++)
        if (domain === lines[i].trim())
            return true;
    return false;
}

function isTempMail(email) {
    // Note: does not work, isTempMail is now a paid service and requires an API token
    return new Promise((resolve, reject) => {
        https.request({
            host: 'www.istempmail.com',
            path: '/api-public/check/' + email
        }, function (res) {
            var body = '';
            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function () {
                winston.info('[plugins/' + pluginData.nbbId + '] isTempMail: ' + body);
                var jsonBody = JSON.parse(body);
                if ("blocked" in jsonBody && jsonBody.blocked) {
                    return resolve(false);
                }

                resolve(true);
            }).on('error', function(err) {
                winston.warn('[plugins/' + pluginData.nbbId + '] Error with the request:', err.message);
                reject(err);
            });
        }).end();
    });
}

Plugin.admin = {
    menu: function (header, callback) {
        header.plugins.push({
            "route": '/plugins/' + pluginData.nbbId,
            "icon": pluginData.faIcon,
            "name": pluginData.name
        });

        callback(null, header);
    }
};

module.exports = Plugin;
