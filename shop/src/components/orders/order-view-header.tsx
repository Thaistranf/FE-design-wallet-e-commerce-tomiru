import { useTranslation } from 'next-i18next';
import cn from 'classnames';
import StatusColor from '@/components/orders/status-color';
import Badge from '@/components/ui/badge';
import PayNowButton from '@/components/payment/pay-now-button';
import { isPaymentPending } from '@/lib/is-payment-pending';
import { SpinnerLoader } from '@/components/ui/loader/spinner/spinner';
import { useSettings } from '@/data/settings';
import ChangeGateway from '../payment/gateway-modal/change-gateway';
import Button from '@/components/ui/button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

interface OrderViewHeaderProps {
  order: any;
  wrapperClassName?: string;
  buttonSize?: 'big' | 'medium' | 'small';
  loading?: boolean;
}

export default function OrderViewHeader({
  order,
  wrapperClassName = 'lg:px-8 lg:py-3 p-6',
  buttonSize = 'medium',
  loading = false,
}: OrderViewHeaderProps) {
  const { settings } = useSettings();
  const { t } = useTranslation('common');
  const isPaymentActionPending = isPaymentPending(
    order?.payment_gateway,
    order?.order_status,
    order?.payment_status,
  );

  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleOpenModal = () => {};

  return (
    <div className={cn(`bg-[#F7F8FA] dark:bg-[#333333] ${wrapperClassName}`)}>
      <Dialog open={open} onClose={handleClose} maxWidth={'sm'} fullWidth>
        <DialogTitle sx={{ m: 0, p: 2, textAlign: 'center' }}>
          OTP đã được gửi về email của quý khách
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: '#fff',
            backgroundColor: '#6E41E2',

            ':hover': {
              backgroundColor: '#000',
            },
          }}
        >
          <CloseIcon />
        </IconButton>

        <div className="p-4">
          <p className=" text-center">
            Quý khách vui lòng nhập OTP xác thực thanh toán
          </p>
          <input
            type="text"
            placeholder="Nhập mã OTP..."
            className="w-full my-4 rounded-md border-none shadow-md shadow-[#9a89b9]"
          />
          <div className="flex justify-end">
            <button>Gửi lại OTP</button>
          </div>
          <div className=" flex justify-center items-center gap-4 mt-4">
            <button
              className=" bg-[#6E41E2] text-white px-4 py-2 rounded-md"
              onClick={handleClose}
            >
              Ok
            </button>
            <button
              className=" border px-4 py-2 rounded-md border-[#6E41E2]"
              onClick={handleClose}
            >
              Huỷ
            </button>
          </div>
        </div>
      </Dialog>
      <div className="text-heading mb-0 flex flex-col flex-wrap items-center gap-x-8 text-base font-bold sm:flex-row md:flex-nowrap">
        <div
          className={`order-2 flex w-full max-w-full basis-full gap-6 xs:flex-nowrap sm:order-1 sm:gap-8 ${
            order?.children?.length > 0 ? '' : 'justify-between'
          } ${isPaymentActionPending ? '' : 'justify-between'}`}
        >
          <div className="flex flex-wrap items-center">
            <span className="mb-2 block text-xs font-normal dark:text-white xs:text-sm lg:mb-0 lg:inline-block lg:ltr:mr-4 lg:rtl:ml-4">
              {t('text-order-status')} :
            </span>
            <div className="w-full lg:w-auto">
              {loading ? (
                <SpinnerLoader />
              ) : (
                <Badge
                  text={t(order?.order_status)}
                  color={StatusColor(order?.order_status)}
                  className="flex min-h-[1.4375rem] items-center justify-center text-[9px] font-bold uppercase !leading-[1.3em] xs:text-xs lg:px-2"
                />
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center">
            <span className="mb-2 block text-xs font-normal dark:text-white xs:text-sm lg:mb-0 lg:inline-block lg:ltr:mr-4 lg:rtl:ml-4">
              {t('text-payment-status')} :
            </span>
            <div className="w-full lg:w-auto">
              {loading ? (
                <SpinnerLoader />
              ) : (
                <Badge
                  text={t(order?.payment_status)}
                  color={StatusColor(order?.payment_status)}
                  className="flex min-h-[1.4375rem] items-center justify-center text-[9px] font-bold uppercase !leading-[1.3em] xs:text-xs lg:px-2"
                />
              )}
            </div>
          </div>
        </div>
        {isPaymentActionPending && order?.children?.length > 0 ? (
          <span className="order-2 mt-5 w-full max-w-full shrink-0 basis-full sm:order-1 md:mt-0 md:w-auto md:max-w-none md:basis-auto md:ltr:ml-auto md:rtl:mr-auto">
            <Button
              className={'w-full text-13px md:px-3 min-h-[36px] sm:h-9 '}
              onClick={handleClickOpen}
            >
              {t('text-pay-now')}
            </Button>
            {/* <PayNowButton
              tracking_number={order?.tracking_number}
              order={order}
            /> */}
          </span>
        ) : null}
        {/* {settings?.paymentGateway?.length > 1 && isPaymentActionPending && (
          <span className="order-2 mt-5 w-full max-w-full shrink-0 basis-full sm:order-1 lg:mt-0 lg:w-auto lg:max-w-none lg:basis-auto lg:ltr:ml-auto lg:rtl:mr-auto">
            <ChangeGateway order={order} />
          </span>
        )} */}
      </div>
    </div>
  );
}
