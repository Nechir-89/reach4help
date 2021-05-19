import { Button, Form, Input, Select, Typography } from 'antd';
import PhoneNumberValidator from 'awesome-phonenumber';
import { allCountries } from 'country-telephone-data';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import firebase from 'src/firebase';
import { COLORS } from 'src/theme/colors';
import styled from 'styled-components';
import useForceUpdate from 'use-force-update';

const { Text } = Typography;
const { Option } = Select;

const PhoneNumberEntryForm: React.FC<PhoneNumberEntryFormProps> = ({
  handleFormSubmit,
  loading,
  reset,
}): React.ReactElement => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [recaptchaVerifier, setRecaptchaVerifier] = useState({});

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const [digits, setDigits] = useState<string>('');
  const [dialCode, setDialCode] = useState<string>('');
  const [numberValidMessage, setNumberValidMessage] = useState<string>('');
  const [numberINValidMessage, setNumberINValidMessage] = useState<string>('');

  const forceUpdate = useForceUpdate();

  useEffect(() => {
    const appVerifier = new firebase.auth.RecaptchaVerifier('submitButton', {
      size: 'invisible',
    });
    setRecaptchaVerifier(appVerifier);
  }, []);

  useEffect(() => {
    if (reset) {
      forceUpdate();
    }
  }, [reset, forceUpdate]);

  const CountryCodeDisplay = styled(Input)`
    /* might need media query to get positioning right */
    height: 32px;
    position: relative;
    width: 5rem;
    &:disabled {
      color: black;
      font-weight: 900px;
      background-color: #d0d0d0;
    }
  `;

  const ErrorDisplay = styled.div`
    color: ${COLORS.backgroundAlternative};
    font-weight: 700;
    width: 75%;
    margin: auto;
    margin-bottom: 1em;
    border: 2px solid ${COLORS.backgroundAlternative};
    padding: 10px;
    text-align: center;
  `;
  const SuccessDisplay = styled.div`
    color: #52c41a;
    font-weight: 700;
    width: 75%;
    margin: auto;
    margin-bottom: 1em;
    border: 2px solid #52c41a;
    padding: 10px;
    text-align: center;
  `;
  // Probably should merge the above two to conditionally color using props

  const FormLabel = styled.div`
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    font-size: 12px;
    line-height: 20px;
    color: rgba(0, 0, 0, 0.65);
    margin: 5px 0;
    align-self: flex-start;
  `;

  const FormSection = styled.div`
    width: 95%;
    max-width: 400px;
  `;

  const Instructions = styled.div`
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    font-size: 20px;
    line-height: 28px;
    text-align: center;
    color: rgba(0, 0, 0, 0.85);
    margin: 30px 0;
  `;

  const showMessage = ({ message, valid }) => {
    if (valid) {
      setNumberValidMessage(message);
      setNumberINValidMessage('');
      return Promise.resolve();
    }
    setNumberValidMessage('');
    setNumberINValidMessage(message);
    return Promise.reject();
  };

  // We might need to do something similar to this initialCheck here to prevent the error message from staying
  const fullTelephoneValidator = (
    value,
    isDigits = false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    initialCheck = false,
  ) => {
    /* TODO:  Check if this conditional is needed */
    if (!value) {
      if (isDigits) {
        return Promise.reject(t('phoneNumber.error_message'));
      }
      return Promise.reject(t('phoneNumber.error_message'));
    }

    let countryCode;
    let number;
    if (isDigits) {
      countryCode = dialCode;
      number = value.replace(/\D/g, '');
    } else {
      countryCode = value;
      number = digits;
    }

    if (!countryCode) {
      return showMessage({
        message: t('phoneNumber.no_country_error'),
        valid: false,
      });
    }

    if (!number) {
      return showMessage({
        message: t('phoneNumber.no_digits_error'),
        valid: false,
      });
    }

    const fullTelephone = `+${countryCode}${number}`;

    const pnv = new PhoneNumberValidator(fullTelephone);

    if (fullTelephone.startsWith('+11')) {
      return showMessage({
        valid: false,
        message: `${fullTelephone} ${t('phoneNumber.is_plus_11')}`,
      });
    }
    if (pnv.isValid() && pnv.canBeInternationallyDialled()) {
      return showMessage({
        valid: true,
        message: `${fullTelephone} ${t('phoneNumber.is_valid_number')}`,
      });
    }
    return showMessage({
      valid: false,
      message: `${fullTelephone} ${t('phoneNumber.is_not_valid_number')}`,
    });
  };

  return (
    <Form
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      autoComplete="off"
      layout="vertical"
      form={form}
      onFinish={async ({ prefix, suffix }) => {
        await fullTelephoneValidator(suffix, true, true);
        handleFormSubmit(
          {
            phoneNumber: `+${prefix.replace(/\D/g, '')}${suffix.replace(
              /\D/g,
              '',
            )}`,
          },
          recaptchaVerifier,
        );
      }}
    >
      <Instructions>{t('phoneNumber.sub_title')}</Instructions>

      <FormSection>
        <FormLabel>{t('phoneNumber.select_instructions')}</FormLabel>
        <Form.Item
          name="prefix"
          rules={[
            {
              validator: (_, value) => fullTelephoneValidator(value, false),
            },
          ]}
        >
          <Select
            showSearch
            style={{ width: '100%' }}
            placeholder={t('phoneNumber.country_placeholder')}
            optionFilterProp="children"
            filterOption={(input, option) =>
              option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            onChange={v => setDialCode(v.toString().replace(/\D/g, ''))}
          >
            {allCountries.map(c => (
              <Option key={c.iso2} value={c.dialCode.concat(c.iso2)}>
                {c.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </FormSection>

      <FormSection>
        <FormLabel>{t('phoneNumber.input_instructions')}</FormLabel>
        <div style={{ display: 'flex' }}>
          <CountryCodeDisplay
            maxLength={4}
            read-only
            disabled
            value={dialCode ? `+${dialCode}` : '+000'}
          />
          <Form.Item
            style={{ textAlign: 'center', width: '100%' }}
            name="suffix"
          >
            <PhoneInput placeholder="1234567" maxLength={14} />
          </Form.Item>
        </div>
      </FormSection>

      {numberINValidMessage && (
        <ErrorDisplay> {numberINValidMessage}</ErrorDisplay>
      )}

      {numberValidMessage && (
        <SuccessDisplay>{numberValidMessage}</SuccessDisplay>
      )}

      <Info>{t('phoneNumber.info')}</Info>
      <Form.Item>
        <SubmitButton
          loading={loading}
          id="submitButton"
          htmlType="submit"
          type="primary"
        >
          {t('continue')}
        </SubmitButton>
      </Form.Item>
    </Form>
  );
};

const PhoneInput = styled(Input)`
  width: 100%;
`;

const Info = styled(Text)`
  color: ${COLORS.faded};
  text-align: center;
`;

const SubmitButton = styled(Button)`
  margin-top: 40px;
`;

interface PhoneNumberEntryFormProps {
  handleFormSubmit: Function;
  loading: boolean;
  reset: boolean;
}

export default PhoneNumberEntryForm;
