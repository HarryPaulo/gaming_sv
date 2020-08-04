const pagarme = require('pagarme');
var db = require('../DB/db');
const api_key = 'ak_test_ZNZXq8e5z1vdDSFFJIBFohFS7QSBIX';

criaAssinatura = (req, res) => {
    let data = req.body;
    console.log(data);
    console.log(data.card_hash);
    pagarme.client.connect({ api_key: api_key }).then(client => client.subscriptions.create({
        customer: data.customer,
        plan_id: data.id_plano_pagarme,
        card_hash: data.card_hash,
        postback_url: 'http://177.183.236.7:3003/postbackAssinaturaPagarme'

    })).then(subscription => {
        console.log(subscription)
        let obj = { id: subscription.id, status: subscription.status, id_plano: data.id_plano, dtini: subscription.current_period_start, dtfim: subscription.current_period_end, id_user: data.id_user };
        console.log(obj);
        db.script('select * from PROC_ADD_ASSINATURA($1, $2, $3, $4, $5, $6)', [subscription.id, subscription.status, data.id_plano, subscription.current_period_start, subscription.current_period_end, data.id_user]).then(r => {
            res.status(200).json({ sucesso: true });
        });
    }).catch((e) => {
        console.log(e.response)
        res.status(500).json({ sucesso: false });
    });
}

cancelarAssinatura = (req, res) => {
    console.log(req.token);
    console.log(req.body.id_user);

    db.select(`select a.id_assinatura_ext
                from assinatura a
                    join users u on (u.id_user = a.id_user)
                where a.id_user = $1
                and   u.token_site = $2
                and   a.fl_status <> 'canceled'`, [req.body.id_user, req.token]).then(result => {
        pagarme.client.connect({ api_key: api_key }).then(client => {
            client.subscriptions.cancel({ id: result[0].id_assinatura_ext });
            // res.status(200).json({ sucesso: true });            
        }).then(subscription => {
            res.status(200).json({ sucesso: true });
            console.log(subscription);
        });
    })
    //    https://api.pagar.me/1/subscriptions/subscription_id/cancel
}

postbackAssinaturaPagarme = (req, res) => {
    let body = req.body;
    
    if (body.event && body.event === 'subscription_status_changed') {
        db.script(`update assinatura set fl_status = $1 
                                        ,dt_ini = $2
                                        ,dt_fim = $3
                                        ,dt_update = current_timestamp
                                        ,fl_status_esperado = $4
                                        ,fl_status_old = $5
                   where id_assinatura_ext = $6`
            , [body.current_status, 
               body.subscription.current_period_start , 
               body.subscription.current_period_end, 
               body.desired_status,
               body.old_status,
               body.id]).then(r => {
                res.status(200).json(r);
        }).catch( e => console.log(e))
    }
    
    console.log('postbackAssinaturaPagarme');
    console.log(req.body);
}

module.exports = {
    criaAssinatura,
    cancelarAssinatura,
    postbackAssinaturaPagarme,
};



/*
{ id: '391015',
  fingerprint: 'b53a2c43f02a2d6357696b0ccf95b028868f14af',
  event: 'subscription_status_changed',
  old_status: 'paid',
  desired_status: 'paid',
  current_status: 'canceled',
  object: 'subscription',
  subscription:
   { object: 'subscription',
     plan:
      { object: 'plan',
        id: '401302',
        amount: '2990',
        days: '30',
        name: 'Basíco',
        trial_days: '0',
        date_created: '2019-01-04T02:56:47.831Z',
        payment_methods: [Array],
        color: '',
        charges: '',
        installments: '1',
        invoice_reminder: '',
        payment_deadline_charges_interval: '1' },
     id: '391015',
     current_transaction:
      { object: 'transaction',
        status: 'paid',
        refuse_reason: '',
        status_reason: 'acquirer',
        acquirer_response_code: '0000',
        acquirer_name: 'pagarme',
        acquirer_id: '5c2cdea74fdd1d2a6d63d88c',
        authorization_code: '891782',
        soft_descriptor: '',
        tid: '4758284',
        nsu: '4758284',
        date_created: '2019-01-08T21:53:49.981Z',
        date_updated: '2019-01-08T21:53:50.610Z',
        amount: '2990',
        authorized_amount: '2990',
        paid_amount: '2990',
        refunded_amount: '0',
        installments: '1',
        id: '4758284',
        cost: '120',
        card_holder_name: 'abv dd',
        card_last_digits: '8548',
        card_first_digits: '550209',
        card_brand: 'mastercard',
        card_pin_mode: '',
        card_magstripe_fallback: 'false',
        postback_url: '',
        payment_method: 'credit_card',
        capture_method: 'ecommerce',
        antifraud_score: '',
        boleto_url: '',
        boleto_barcode: '',
        boleto_expiration_date: '',
        referer: 'api_key',
        ip: '177.183.236.7',
        subscription_id: '391015',
        split_rules: '',
        reference_key: '',
        device: '',
        local_transaction_id: '',
        local_time: '',
        fraud_covered: 'false',
        order_id: '',
        risk_level: 'very_low',
        receipt_url: '',
        payment: '',
        addition: '',
        discount: '' },
     postback_url: 'http://177.183.236.7:3003/postbackAssinaturaPagarme',
     payment_method: 'credit_card',
     card_brand: 'mastercard',
     card_last_digits: '8548',
     current_period_start: '2019-01-08T21:53:49.943Z',
     current_period_end: '2019-02-07T21:53:49.942Z',
     charges: '0',
     status: 'canceled',
     date_created: '2019-01-08T21:53:50.598Z',
     date_updated: '2019-01-08T22:00:53.772Z',
     phone:
      { object: 'phone',
        ddi: '55',
        ddd: '48',
        number: '996436821',
        id: '394856' },
     address:
      { object: 'address',
        street: 'Rua Deonilda Milanez',
        complementary: '',
        street_number: '285',
        neighborhood: 'Milanese',
        city: 'Criciúma',
        state: 'SC',
        zipcode: '88804515',
        country: 'Brasil',
        id: '608096' },
     customer:
      { object: 'customer',
        id: '879757',
        external_id: '',
        type: '',
        country: '',
        document_number: '09295664914',
        document_type: 'cpf',
        name: 'Paulo Henrique Fabris',
        email: 'paulo_fabris@hotmail.com',
        phone_numbers: '',
        born_at: '',
        birthday: '',
        gender: '',
        date_created: '2019-01-08T21:53:49.897Z' },
     card:
      { object: 'card',
        id: 'card_cjqoal5la0044f16dlqkqw50o',
        date_created: '2019-01-08T21:53:49.966Z',
        date_updated: '2019-01-08T21:53:50.591Z',
        brand: 'mastercard',
        holder_name: 'abv dd',
        first_digits: '550209',
        last_digits: '8548',
        country: 'BRAZIL',
        fingerprint: 'cjqi2oxeo98sq0i487d5lgc30',
        valid: 'true',
        expiration_date: '1221' },
     metadata: '',
     settled_charges: '',
     manage_url:
      'https://pagar.me/customers/#/subscriptions/391015?token=test_subscription_fDsuTclFkcqZFwlyDZNInXrgQzTiXH' } }
*/      