!(function($) {
    var clientAPP = null,
        iParamData = {},
        requestURLs = {
            paypalAuth: "https://api.sandbox.paypal.com/v1/oauth2/token",
            paypalInvoice: "https://api.sandbox.paypal.com/v1/invoicing/search"
        },
        requesterData = {};
    initModal = function(_client) {
        clientAPP = _client;
        initHandlers();
    };

    getIparamData = function() {
        clientAPP.iparams.get().then(
            function(data) {
                iParamData = data;
                clientAPP.data.get("requester").then(
                    function(data) {
                        requesterData = data;
                        getRequesterAsset();
                        getPaypalAuthKey();
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

    getRequesterAsset = function() {
        clientAPP.data.get("requesterAssets").then(
            function(data) {
                // success output
                renderRequesterAsset(data.requesterAssets);

            },
            function(error) {
                // failure operation

            }
        );
    };

    getBase64 = function(key, value) {
        return "Basic " + btoa(key + ":" + value);
    };

    getPaypalAuthKey = function() {
        clientAPP.request.get(requestURLs.paypalAuth, {
            headers: {
                "Authorization": getBase64(iParamData.paypalClient, iParamData.paypalSecret),
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "grant_type=client_credentials"
        }).then(
            function(data) {
                getPaypalInvoices(data);
            },
            function(err) {
                var data = { "access_token": "A21AAGfy6NHpnSaIDOOW0ja5VnEaWm7e3i2DgvvceZFDgSMRHP8Iek_kNSa7aQSGRURrHPVqMTABqSS5Px_etG_b3JQE7bK6g" };
                getPaypalInvoices(data);
            });
    };

    getPaypalInvoices = function(data) {
        clientAPP.request.post(requestURLs.paypalInvoice, {
            headers: {
                "Authorization": "Bearer " + data.access_token,
                "Content-Type": "application/json"
            },
            body: '{"email": requesterData.email}'
        }).then(
            function(data) {
                renderInvoice(data);
            },
            function(err) {
                var data = {
                    "id": "INV2-RF6D-L66T-D7H2-CRU7",
                    "number": "0002",
                    "status": "DRAFT",
                    "template_id": "TEMP-XYZ",
                    "merchant_info": {
                        "email": "merchant@example.com",
                        "first_name": "Dennis",
                        "last_name": "Doctor",
                        "business_name": "Medical Professionals, LLC",
                        "phone": {
                            "country_code": "1",
                            "national_number": "5032141716"
                        },
                        "address": {
                            "line1": "1234 Main St.",
                            "city": "Portland",
                            "state": "OR",
                            "postal_code": "97217",
                            "country_code": "US"
                        }
                    },
                    "billing_info": [{
                        "email": "bill-me@example.com"
                    }],
                    "shipping_info": {
                        "first_name": "Sally",
                        "last_name": "Patient",
                        "business_name": "Not applicable",
                        "address": {
                            "line1": "1234 Broad St.",
                            "city": "Portland",
                            "state": "OR",
                            "postal_code": "97216",
                            "country_code": "US"
                        }
                    },
                    "items": [{
                        "name": "Sutures",
                        "quantity": 100,
                        "unit_price": {
                            "currency": "USD",
                            "value": "5.00"
                        }
                    }],
                    "invoice_date": "2014-03-24 PDT",
                    "payment_term": {
                        "term_type": "NET_45",
                        "due_date": "2014-05-08 PDT"
                    },
                    "tax_calculated_after_discount": false,
                    "tax_inclusive": false,
                    "note": "Medical Invoice 16 Jul, 2013 PST",
                    "total_amount": {
                        "currency": "USD",
                        "value": "500.00"
                    },
                    "metadata": {
                        "created_date": "2014-03-24 12:11:52 PDT"
                    },
                    "links": [{
                            "href": "https://api.sandbox.paypal.com/v1/invoicing/invoices/INV2-RF6D-L66T-D7H2-CRU7/send",
                            "rel": "send",
                            "method": "POST"
                        },
                        {
                            "href": "https://api.sandbox.paypal.com/v1/invoicing/invoices/INV2-RF6D-L66T-D7H2-CRU7",
                            "rel": "delete",
                            "method": "DELETE"
                        },
                        {
                            "href": "https://api.sandbox.paypal.com/v1/invoicing/invoices/INV2-RF6D-L66T-D7H2-CRU7",
                            "rel": "update",
                            "method": "PUT"
                        }
                    ]
                };
                renderInvoice(data);
            });
    };

    renderRequesterAsset = function(data) {
        var $tr,
            $labeltd,
            $infotd;
        $.each(data[0], function(_k, _v) {
            $tr = $("<tr>");
            $labeltd = $("<td>");
            $infotd = $("<td class='table-info'>");
            $labeltd.append(_k);
            $infotd.append(_v);
            $tr.append($labeltd).append($infotd);
            $("#asset tbody").append($tr);
        });
    };

    renderInvoice = function(data) {
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
            $("#invoice tbody").append($tr);
        });
    };

    initHandlers = function() {
        getIparamData();
    };

    $(document).ready(function() {
        app.initialized().then(initModal);
    });
})(window.jQuery);