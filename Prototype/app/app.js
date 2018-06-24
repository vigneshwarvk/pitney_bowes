!(function($) {
    var clientAPP = null,
        isTopNav = false,
        iParamData = {},
        requestURLs = {
            pitneyAuth: "https://api-sandbox.pitneybowes.com/oauth/token",
            paypalInvoice: "https://api-sandbox.pitneybowes.com/shippingservices/v1/tracking/#{trackingNumber}?packageIdentifierType=TrackingNumber&carrier=USPS "
        },
        requesterData = {};

    initAPP = function(_client) {
        clientAPP = _client;
        clientAPP.events.on('app.activated', initHandlers);
    };

    getIparamData = function() {
        clientAPP.iparams.get().then(
            function(data) {
                iParamData = data;
                clientAPP.data.get("requester").then(
                    function(data) {
                        requesterData = data;
                    },
                    function(error) {
                        // failure operation
                    }
                );
            },
            function(error) {
                console.log(error);
                // failure operation
            }
        );
    };

    initHandlers = function() {
        if (!isTopNav) { //Hack since Freshservice does not support instance api unlike Freshdesk
            clientAPP.interface.trigger('showModal', { title: 'Requester Details', template: 'content.html' })
                .then(
                    function(data) {
                        console.log("App Loaded");
                        isTopNav = true;
                    },
                    function(error) {
                        console.log(error);
                    }
                );
        } else {
            isTopNav = false;
        }
        $(document).on("click", "#trackShipment", trackShipment);

    };


    getBase64 = function(key, value) {
        return "Basic " + btoa(key + ":" + value);
    };

    getTrackingData = function(data) {
        clientAPP.request.post(requestURLs.paypalInvoice.interpolate({ trackingNumber: jQuery("#tracking_id").val() }), {
            headers: {
                "Authorization": "Bearer " + data.access_token,
                "Content-Type": "application/json"
            }
        }).then(
            function(data) {
                renderTrackingData(data);
            },
            function(err) {
                var data = {
                    "packageCount": 1,
                    "carrier": "USPS",
                    "trackingNumber": "9405509898641500000146",
                    "status": "Manifest",
                    "updatedDate": "2018-01-19",
                    "updatedTime": "17:48:00",
                    "shipDate": "2018-01-19",
                    "estimatedDeliveryDate": null,
                    "estimatedDeliveryTime": null,
                    "deliveryDate": null,
                    "deliveryTime": null,
                    "deliveryLocation": null,
                    "deliveryLocationDescription": null,
                    "signedBy": null,
                    "weight": 0,
                    "weightOUM": null,
                    "reattemptDate": null,
                    "reattemptTime": null,
                    "destinationAddress": {
                        "name": null,
                        "address1": null,
                        "address2": null,
                        "address3": null,
                        "city": "DECATUR",
                        "stateOrProvince": "IN",
                        "postalCode": 46733,
                        "country": null
                    },
                    "senderAddress": {
                        "name": null,
                        "address1": null,
                        "address2": null,
                        "address3": null,
                        "city": "SHELTON",
                        "stateOrProvince": "CT",
                        "postalCode": "06484",
                        "country": null
                    },
                    "scanDetailsList": [{
                        "eventDate": "2018-01-19",
                        "eventTime": "17:48:00",
                        "eventCity": "SHELTON",
                        "eventStateOrProvince": "CT",
                        "postalCode": "06484",
                        "country": null,
                        "scanType": "GX",
                        "scanDescription": "Shipping Label Created",
                        "packageStatus": "Manifest"
                    }]
                };
                renderTrackingData(data);
            });
    };

    renderTrackingData = function(data) {
        var $tr,
            $labeltd,
            $infotd;
        $.each(data, function(_k, _v) {
            $tr = $("<tr>");
            $labeltd = $("<td>");
            $infotd = $("<td class='table-info'>");
            $labeltd.append(_k);
            $infotd.append(_v);
            $tr.append($labeltd).append($infotd);
            $("table tbody").append($tr);
        });
    };

    trackShipment = function() {
        clientAPP.request.get(requestURLs.pitneyAuth, {
            headers: {
                "Authorization": getBase64(iParamData.pitneyClient, iParamData.pitneySecret),
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "grant_type=client_credentials"
        }).then(
            function(data) {
                getTrackingData(data);
            },
            function(err) {
                var data = { "access_token": "A21AAGfy6NHpnSaIDOOW0ja5VnEaWm7e3i2DgvvceZFDgSMRHP8Iek_kNSa7aQSGRURrHPVqMTABqSS5Px_etG_b3JQE7bK6g" };
                getTrackingData(data);
            });
    };

    $(document).ready(function() {
        app.initialized().then(initAPP);
    });

})(window.jQuery);