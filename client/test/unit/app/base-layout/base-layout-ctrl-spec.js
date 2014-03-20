describe('base-layout-ctrl',function () {

    var getCtrl;

    beforeEach(function () {
        module('base-layout-mod');
        inject(function ($rootScope,$controller) {
            getCtrl = function () {
                return $controller('BaseLayoutCtrl',{
                    $scope: $rootScope.$new()
                });
            }
        });
    });

    it('is defined',function () {
        var ctrl = getCtrl();
        expect(ctrl).toBeDefined();
    });
});
