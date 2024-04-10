import { useRouter } from 'next/router';
import { useMutation } from 'react-query';
import { useAtom } from 'jotai';
import toast from 'react-hot-toast';
import client from '@/data/client';
import usePrice from '@/lib/hooks/use-price';
import Button from '@/components/ui/button';
import { useCart } from '@/components/cart/lib/cart.context';
import {
  calculatePaidTotal,
  calculateTotal,
} from '@/components/cart/lib/cart.utils';
import CartWallet from '@/components/cart/cart-wallet';
import { usePhoneInput } from '@/components/ui/forms/phone-input';
import {
  payableAmountAtom,
  useWalletPointsAtom,
  verifiedTokenAtom,
  checkoutAtom,
} from '@/components/cart/lib/checkout';
import PaymentGrid from '@/components/cart/payment/payment-grid';
import routes from '@/config/routes';
import { useTranslation } from 'next-i18next';
import { PaymentGateway } from '@/types';
import { useSettings } from '@/data/settings';
import { REVIEW_POPUP_MODAL_KEY } from '@/lib/constants';
import Cookies from 'js-cookie';
import CachedIcon from '@mui/icons-material/Cached';
import { Button as MuiButton } from '@mui/material';

export default function CartCheckout() {
  const { settings } = useSettings();
  const router = useRouter();
  const { t } = useTranslation('common');

  // const { mutate, isLoading } = useMutation(client.orders.create, {
  //   onSuccess: (res) => {
  //     const { tracking_number, payment_gateway, payment_intent } = res;
  //     if (tracking_number) {
  //       if (
  //         [PaymentGateway.FULL_WALLET_PAYMENT].includes(
  //           payment_gateway as PaymentGateway,
  //         )
  //       ) {
  //         return router.push(`${routes.orderUrl(tracking_number)}/payment`);
  //       }

  //       if (payment_intent?.payment_intent_info?.is_redirect) {
  //         return router.push(
  //           payment_intent?.payment_intent_info?.redirect_url as string,
  //         );
  //       } else {
  //         return router.push(`${routes.orderUrl(tracking_number)}/payment`);
  //       }
  //     }
  //   },

  //   onError: (err: any) => {
  //     toast.error(<b>{t('text-profile-page-error-toast')}</b>);
  //   },
  // });
  const { mutate, isLoading } = useMutation(client.orders.create, {
    onSuccess: (res) => {
      // const { tracking_number, payment_gateway, payment_intent } = res;
      return router.push(`${routes.orderUrl(res.tracking_number)}/payment`);
    },

    onError: (err: any) => {
      toast.error(<b>{t('text-profile-page-error-toast')}</b>);
    },
  });

  const [{ payment_gateway }] = useAtom(checkoutAtom);
  const [use_wallet_points] = useAtom(useWalletPointsAtom);
  const [payableAmount] = useAtom(payableAmountAtom);
  const [token] = useAtom(verifiedTokenAtom);
  const { items, verifiedResponse } = useCart();

  const available_items = items.filter(
    (item) =>
      !verifiedResponse?.unavailable_products?.includes(item.id.toString()),
  );

  // Calculate price
  const { price: tax } = usePrice(
    verifiedResponse && {
      amount: verifiedResponse.total_tax ?? 0,
    },
  );

  const base_amount = calculateTotal(available_items);

  const { price: sub_total } = usePrice(
    verifiedResponse && {
      amount: base_amount,
    },
  );

  const totalPrice = verifiedResponse
    ? calculatePaidTotal(
        {
          totalAmount: base_amount,
          // tax: verifiedResponse.total_tax,
          tax: 0,
          shipping_charge: verifiedResponse.shipping_charge,
        },
        0,
      )
    : 0;

  const { price: total } = usePrice(
    verifiedResponse && {
      amount: totalPrice,
    },
  );

  // phone number field
  const { phoneNumber } = usePhoneInput();
  function createOrder() {
    // if (
    //   (use_wallet && Boolean(payableAmount) && !token) ||
    //   (!use_wallet && !token)
    // ) {
    //   toast.error(<b>Please verify payment card</b>, {
    //     className: '-mt-10 xs:mt-0',
    //   });
    //   return;
    // }

    // if (!phoneNumber && settings?.useOtp) {
    //   toast.error(<b>{t('text-enter-phone-number')}</b>);
    //   window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    //   return;
    // }

    if (settings?.useOtp) {
      if (!phoneNumber) {
        toast.error(<b>{t('text-enter-phone-number')}</b>);
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        return;
      }
    }

    //   const isFullWalletPayment =
    //     use_wallet_points && payableAmount == 0 ? true : false;
    //   const gateWay = isFullWalletPayment
    //     ? PaymentGateway.FULL_WALLET_PAYMENT
    //     : payment_gateway;

    //   mutate({
    //     amount: base_amount,
    //     total: totalPrice,
    //     paid_total: totalPrice,
    //     products: available_items.map((item) => ({
    //       product_id: item.id,
    //       order_quantity: item.quantity,
    //       unit_price: item.price,
    //       subtotal: item.price * item.quantity,
    //     })),
    //     payment_gateway: gateWay,
    //     use_wallet_points,
    //     isFullWalletPayment,
    //     ...(token && { token }),
    //     sales_tax: verifiedResponse?.total_tax ?? 0,
    //     customer_contact: phoneNumber ? phoneNumber : '1',
    //   });
    //   Cookies.remove(REVIEW_POPUP_MODAL_KEY);
    // }

    const isFullWalletPayment =
      use_wallet_points && payableAmount == 0 ? true : false;
    const gateWay = isFullWalletPayment
      ? PaymentGateway.FULL_WALLET_PAYMENT
      : payment_gateway;

    const data = {
      amount: base_amount,
      total: totalPrice,
      paid_total: totalPrice,
      products: available_items.map((item) => ({
        product_id: item.id,
        order_quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
      })),
      payment_gateway: PaymentGateway.CASH,
      use_wallet_points,
      isFullWalletPayment,
      ...(token && { token }),
      sales_tax: verifiedResponse?.total_tax ?? 0,
      customer_contact: phoneNumber ? phoneNumber : '1',

      // Cookies.remove(REVIEW_POPUP_MODAL_KEY);
    };
    mutate(data);
  }
  function rechargeHandler() {
    //link đến trang nạp tiền
  }
  return (
    <div className="mt-10 border-t border-light-400 bg-light pt-6 pb-7 dark:border-dark-400 dark:bg-dark-250 sm:bottom-0 sm:mt-12 sm:pt-8 sm:pb-9">
      <div className="mb-6 flex flex-col gap-3 text-dark dark:text-light sm:mb-7">
        {/* <div className="flex justify-between">
          <p>{t('text-subtotal')}</p>
          <strong className="font-semibold pr-7">{`${sub_total} Tomxu`}</strong>
        </div>
        <div className="flex justify-between">
          <p>{t('text-tax')}</p>
          <div className="flex flex-col pr-7 ">
            <strong className="font-semibold ">{`${tax} Tomxu`}</strong>
          </div>
        </div> */}
        <div className="flex justify-between items-center pr-20">
          <span className="font-bold text-base">Tổng</span>
          <strong className="font-semibold text-base">
            {totalPrice} {`Tomxu`}
          </strong>
        </div>

        <div className="flex justify-between items-center border-t border-light-400 bg-light pt-6 pb-7 dark:border-dark-400 dark:bg-dark-250 sm:bottom-0 sm:mt-12 sm:pt-8 sm:pb-9">
          {/*<p>{t('Current wallet balance')}</p>*/}
          <p className="font-bold text-base">Số dư ví hiện tại</p>
          <div className=" flex gap-4 justify-center items-center">
            <strong className="font-semibold text-base">100 Tomxu</strong>
            <MuiButton>
              <CachedIcon style={{ color: 'black' }} />
            </MuiButton>
          </div>
        </div>

        <button
          className="mr-20 w-2/6 max-w-[122px] min-w-fit md:h-[50px] md:text-sm bg-[#F91111] ml-auto hover:bg-red-300 text-white rounded-md"
          // isLoading={isLoading}
          onClick={rechargeHandler}
        >
          {t('Nạp tiền')}
        </button>
      </div>
      {/* {verifiedResponse && (
        <CartWallet
          totalPrice={totalPrice}
          walletAmount={verifiedResponse.wallet_amount}
          walletCurrency={verifiedResponse.wallet_currency}
        />
      )} */}

      {/* {use_wallet_points && !Boolean(payableAmount) ? null : <StripePayment />} */}

      {/* {use_wallet_points && !Boolean(payableAmount) ? null : <PaymentGrid />} */}

      <Button
        disabled={isLoading}
        isLoading={isLoading}
        onClick={createOrder}
        className="w-full md:h-[50px] md:text-sm"
      >
        {t('text-submit-order')}
      </Button>
    </div>
  );
}
