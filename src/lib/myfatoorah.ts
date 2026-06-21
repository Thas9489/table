export interface MFPaymentMethod {
  PaymentMethodId: number
  PaymentMethodAr: string
  PaymentMethodEn: string
  PaymentMethodCode: string
  IsDirectPayment: boolean
  ServiceCharge: number
  TotalAmount: number
  CurrencyIso: string
  ImageUrl: string
}

export interface MFInitiateData {
  InvoiceAmount: number
  CurrencyIso: string
  PaymentMethods: MFPaymentMethod[]
}

export interface MFExecuteData {
  InvoiceId: number
  IsDirectPayment: boolean
  PaymentURL: string
  CustomerReference: string
  UserDefinedField: string
}

export interface MFStatusData {
  InvoiceId: number
  InvoiceStatus: string
  InvoiceValue: number
  CustomerName: string
  CustomerEmail: string
  CustomerReference: string
  UserDefinedField: string
  TransactionDate: string
  PaymentGateway: string
  TransactionId: string
  PaymentId: string
  TrackId: string
  ReferenceId: string
  InvoiceItems: { ItemName: string; Quantity: number; UnitPrice: number }[]
}

const BASE_URL = process.env.MYFATOORAH_BASE_URL ?? 'https://apitest.myfatoorah.com'

async function mfPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const apiKey = process.env.MYFATOORAH_API_KEY
  if (!apiKey) throw new Error('MYFATOORAH_API_KEY is not configured')

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })

  const json = await res.json()
  if (!json.IsSuccess) {
    throw new Error(json.Message ?? `MyFatoorah error on ${path}`)
  }
  return json.Data as T
}

export async function mfInitiatePayment(amount: number, currency = 'KWD') {
  return mfPost<MFInitiateData>('/v2/InitiatePayment', {
    InvoiceAmount: amount,
    CurrencyIso: currency,
  })
}

export async function mfExecutePayment(p: {
  methodId: number
  amount: number
  currency: string
  customerName: string
  customerEmail: string
  callbackUrl: string
  errorUrl: string
  itemName: string
  transactionRef: string
}) {
  return mfPost<MFExecuteData>('/v2/ExecutePayment', {
    PaymentMethodId: p.methodId,
    CustomerName: p.customerName,
    DisplayCurrencyIso: p.currency,
    MobileCountryCode: '+965',
    CustomerMobile: '99999999',
    CustomerEmail: p.customerEmail,
    InvoiceValue: p.amount,
    CallBackUrl: p.callbackUrl,
    ErrorUrl: p.errorUrl,
    Language: 'en',
    CustomerReference: p.transactionRef,
    UserDefinedField: p.transactionRef,
    ExpiryDate: '',
    InvoiceItems: [{ ItemName: p.itemName, Quantity: 1, UnitPrice: p.amount }],
  })
}

export async function mfGetPaymentStatus(paymentId: string) {
  return mfPost<MFStatusData>('/v2/GetPaymentStatus', {
    Key: paymentId,
    KeyType: 'PaymentId',
  })
}
