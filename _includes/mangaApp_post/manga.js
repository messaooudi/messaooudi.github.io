import angular from 'angular';
import angularMeteor from 'angular-meteor';
import uiRouter from 'angular-ui-router';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker'

import mobileTemplate from './mobile.html';

import './mobile.css';

class Manga {
    constructor($scope,$reactive,$stateParams) {
        'ngInject';
        $reactive(this).attach($scope);
        var vm = this;
        vm.manga = $stateParams.manga;
    }
}

const name = 'manga';
const template = mobileTemplate;
export default angular.module(name, [
    angularMeteor,
    uiRouter,
]).component(name, {
    template,
    controllerAs: name,
    controller: Manga
}).config(config);
function config($locationProvider, $stateProvider, $urlRouterProvider) {
    'ngInject';
    $stateProvider
        .state('manga', {
            url: '/manga/:manga',
            template: '<manga></manga>',
        })
}