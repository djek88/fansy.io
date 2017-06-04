'use strict';

angular
	.module('app.streamer')
	.factory('streamerHighlightsService', streamerHighlightsService);

function streamerHighlightsService(/*$http, Group, Additional, APP_CONFIG*/) {
	var service = {
		/*prepareGroup: prepareGroup,
		getDefaultImgData: getDefaultImgData,
		countriesMap: countriesMap,
		uploadStatesOrCitiesMap: uploadStatesOrCitiesMap,
		timeZoneMap: buidTimeZoneMap(),
		languagesMap: buidLanguagesMap(),
		createGroup: createGroup,
		uploadPicture: uploadPicture,
		uploadAttachment: uploadAttachment*/
	};
	return service;

/*	function prepareGroup(groupTypes, penaltyAmounts, sessionDayTypes, sessionTimeTypes, sessionFrequencyTypes) {
		return {
			name: '',
			type: +Object.keys(groupTypes)[0],
			avatar: '/GroupAvatars/default-avatar/download/group.png',
			penalty: penaltyAmounts[0],
			maxMembers: 5,
			private: true,
			memberCanInvite: false,
			description: '',
			joiningFee: 0,
			quarterlyFee: 0,
			monthlyFee: 0,
			yearlyFee: 0,
			hideMembers: false,
			sessionConf: {
				sheduled: true,
				language: 'en',
				offline: false,
				country: '',
				state: '',
				city: '',
				withoutFacilitator: false,
				day: +Object.keys(sessionDayTypes)[0],
				time: Object.keys(sessionTimeTypes)[0],
				timeZone: jstz.determine().name(),
				frequencyType: +Object.keys(sessionFrequencyTypes)[0],
				roundLength: [120, 180, 90, 120]
			}
		};
	}

	function countriesMap(countries) {
		countries = angular.copy(countries);
		countries.unshift({ id: '', name: 'Please select' });
		return countries;
	}

	function uploadStatesOrCitiesMap(countryId, stateId, cb) {
		var defaultOptions = [{ id: '', name: 'Please select' }];

		if (countryId) {
			if (stateId) {
				Additional.supportedCountries({
					countryId: countryId,
					stateId: stateId
				}, resolveOpts);
			} else {
				Additional.supportedCountries({
					countryId: countryId
				}, resolveOpts);
			}
		} else {
			return defaultOptions;
		}

		function resolveOpts(opts) {
			opts.unshift(defaultOptions[0]);
			cb(opts);
		}
	}

	function buidTimeZoneMap() {
		var results = [];

		moment.tz.names().forEach(function(zoneName) {
			var tz = moment.tz(zoneName);

			results.push({
				id: zoneName,
				name: zoneName.replace(/_/g, ' '),
				offset: 'UTC' + tz.format('Z'),
				nOffset: tz.utcOffset()
			});
		});

		return results;
	}

	function buidLanguagesMap() {
		return languages.getAllLanguageCode().map(function(langCode) {
			return {
				code: langCode,
				name: languages.getLanguageInfo(langCode).name
			};
		});
	}

	function createGroup(group, cb) {
		Group.create(group, cb);
	}

	function uploadPicture(pictureFile, groupId, cb) {
		var url = APP_CONFIG.apiRootUrl + '/Groups/' + groupId + '/upload-avatar';

		var fd = new FormData();
		fd.append('file', pictureFile);

		$http.post(url, fd, {
			transformRequest: angular.identity,
			headers: {'Content-Type': undefined}
		}).success(cb);
	}

	function uploadAttachment(attachmentFile, groupId, cb) {
		var url = APP_CONFIG.apiRootUrl + '/Groups/' + groupId + '/upload-attachment';

		var fd = new FormData();
		fd.append('file', attachmentFile);

		$http.post(url, fd, {
			transformRequest: angular.identity,
			headers: {'Content-Type': undefined}
		}).success(cb);
	}

	function getDefaultImgData(group) {
		var actualGroupAvatar = APP_CONFIG.apiRootUrl + group.avatar;

		return {
			selectedPicture: actualGroupAvatar,
			newPicture: null
		};
	}*/
}