const xpr_objects = require("/xpr/request");
const api = xpr_objects.XprApi;
const _ = require("/xpr/underscore");
//const moment = require("/xpr/moment");

// check authentication
exports.checkAuth = function checkAuth(accessToken) {    
    let token = api({
        uri: "/auth/tokens/",
        method: "GET",
        params: { "Token__eq": accessToken }
    });
    if (!token.length) return { error: "token not found."};
    let expiry = (new Date(token[0].Expiry)).toISOString();
    let today = (new Date()).toISOString();
    return ((Date.parse(expiry) >= Date.parse(today) && token.length)) ? { status: "valid token." } : { error: "invalid/expired token." };
}

// get pagination
exports.pagination = function pagination(data) {
    // add page object to loop on frontend
    let pages = [];
    function add_page_object(total_pages) {
        for (let i=0;i<total_pages;i++) {
            pages.push({page: i+1});
        }
        return pages;
    }
    // for collections with "collectionFormat" set to "hal"
    let total_items = data.total || 0;
    let pagination = {};
    let per_page = data.per_page || 10;
    let page = Number(data.page) || Number(1);
    pagination.totalPages = Math.ceil(total_items / per_page);
    if (page < pagination.totalPages) pagination.nextPage = page+1;
    if (page > 1) pagination.prevPage = page-1;
    pagination.pages = add_page_object(pagination.totalPages);
    return pagination;
}

/* store related functions */

function getPaymentMethod(name) {
    return api({
        uri: "/store/paymentMethods/",
        method: "GET",
        params: { "Name__eq": name }
    });
}

// pay by credit card
exports.payByCreditCard = function payByCreditCard(cardNumber, fullName, month, year, cvv, dollarAmount, orderId) {
    cvv = parseInt(cvv);
    cardNumber = String(cardNumber);
    let paymentMethod = getPaymentMethod("Credit Card");
    let payload = {
        PaymentMethodId: paymentMethod[0].Id,
        DollarAmount: dollarAmount,
        _embedded: {
            CreditCard: {
                CardNumber: cardNumber,
                CVV: cvv,
                FullName: fullName,
                Month: month,
                Year: year
            }
        }
    }
    let paid_order = api({
        uri: "/store/orders/" + orderId + "/pay",
        method: "POST",
        data: { Payment: payload }
    });
    // we need to re-fetch order to bypass cache or it would not update status/paidstatus correctly - could be a bug in api?
    return api({
        uri: "/store/orders/" + paid_order.Id,
        method: "GET",
        params: { with: "OrderTransactions", refresh: paid_order.Id }
    });
}

// pay by givex
exports.payByGivex = function payByGivex(givexNumber, amount, orderId) {
    let paymentMethod = getPaymentMethod("Givex");
    let payload = {
        PaymentMethodId: paymentMethod[0].Id,
        DollarAmount: amount,
        _embedded: {
            Givex: {
                GivexNumber: givexNumber
            }
        }
    }
    let paid_order = api({
        uri: "/store/orders/" + orderId + "/pay",
        method: "POST",
        data: { Payment: payload }
    });
    // we need to re-fetch order to bypass cache or it would not update status/paidstatus correctly - could be a bug in api?
    return api({
        uri: "/store/orders/" + paid_order.Id,
        method: "GET",
        params: { with: "OrderTransactions", refresh: paid_order.Id }
    });
}

// return
exports.return_order = function return_order(OrderId, ReturnedProducts) {
    return api({
        uri: "/store/orders/" + OrderId + "/return",
        method: "POST",
        data: {
            Restock: false,
            WarehouseId: 0,
            Warehouse: "Default Warehouse",
            _embedded: {
                ReturnedOrderProducts: ReturnedProducts
            }   
        }
    });
}

// refund
exports.refund = function refund(OrderId, OrderTransactionId, DollarAmount, OrderPaymentId, OrderProductId) {
    return api({
        uri: "/store/orders/" + OrderId + "/refund",
        method: "POST",
        data: {
            OrderTransactionId: OrderTransactionId,
            DollarAmount: DollarAmount,
            OrderPaymentId: OrderPaymentId,
            OrderProductId: OrderProductId
        }
    });
}