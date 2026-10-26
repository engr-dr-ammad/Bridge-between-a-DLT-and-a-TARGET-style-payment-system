import { v4 as uuidv4 } from 'uuid';
import { ISO20022PaymentInitiation } from './types';

export class ISO20022Generator {
  generatePaymentInitiation(
    debtor: string,
    debtorAccount: string,
    debtorBank: string,
    creditor: string,
    creditorAccount: string,
    creditorBank: string,
    amount: number,
    currency: string,
    reference: string
  ): ISO20022PaymentInitiation {
    const messageId = `MSG-${uuidv4()}`;
    const creationTimestamp = new Date().toISOString();
    const executionDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return {
      messageId,
      creationTimestamp,
      debtor: {
        name: debtor,
        account: debtorAccount,
        bankCode: debtorBank,
      },
      creditor: {
        name: creditor,
        account: creditorAccount,
        bankCode: creditorBank,
      },
      amount,
      currency,
      executionDate,
      purpose: 'DLT-TRADE-SETTLEMENT',
      reference,
    };
  }

  serializeToXml(payment: ISO20022PaymentInitiation): string {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.003.02">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>${payment.messageId}</MsgId>
      <CreDtTm>${payment.creationTimestamp}</CreDtTm>
      <NbOfTxns>1</NbOfTxns>
      <CtrlSum>${payment.amount}</CtrlSum>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>${payment.messageId}</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <ReqdExctnDt>${payment.executionDate}</ReqdExctnDt>
      <Dbtr>
        <Nm>${payment.debtor.name}</Nm>
        <Id>
          <OrgId>
            <BICOrBEI>${payment.debtor.bankCode}</BICOrBEI>
          </OrgId>
        </Id>
      </Dbtr>
      <DbtrAcct>
        <Id>
          <IBAN>${payment.debtor.account}</IBAN>
        </Id>
      </DbtrAcct>
      <CdtTrfTxInf>
        <Amt>
          <InstdAmt Ccy="${payment.currency}">${payment.amount}</InstdAmt>
        </Amt>
        <Cdtr>
          <Nm>${payment.creditor.name}</Nm>
          <Id>
            <OrgId>
              <BICOrBEI>${payment.creditor.bankCode}</BICOrBEI>
            </OrgId>
          </Id>
        </Cdtr>
        <CdtrAcct>
          <Id>
            <IBAN>${payment.creditor.account}</IBAN>
          </Id>
        </CdtrAcct>
        <RmtInf>
          <Ustrd>${payment.purpose}|${payment.reference}</Ustrd>
        </RmtInf>
      </CdtTrfTxInf>
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`;
    return xml;
  }
}
