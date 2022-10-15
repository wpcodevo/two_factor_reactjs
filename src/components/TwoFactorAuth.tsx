import { FC, useEffect, useState } from "react";
import QRCode from "qrcode";
import { useForm, SubmitHandler } from "react-hook-form";
import { object, string, TypeOf } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authApi } from "../api/authApi";
import { toast } from "react-toastify";
import useStore from "../store";
import { IUser } from "../api/types";

const styles = {
  heading3: `text-xl font-semibold text-gray-900 p-4 border-b`,
  heading4: `text-base text-ct-blue-600 font-medium border-b mb-2`,
  modalOverlay: `overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full`,
  orderedList: `space-y-1 text-sm list-decimal`,
  buttonGroup: `flex items-center py-6 space-x-2 rounded-b border-t border-gray-200 dark:border-gray-600`,
  buttonBlue: `text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800`,
  buttonGrey: `text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600`,
  inputField: `bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-2/5 p-2.5`,
};

type TwoFactorAuthProps = {
  otpauth_url: string;
  base32: string;
  user_id: string;
  closeModal: () => void;
};

const twoFactorAuthSchema = object({
  token: string().min(1, "Authentication code is required"),
});

type TwoFactorAuthInput = TypeOf<typeof twoFactorAuthSchema>;

const TwoFactorAuth: FC<TwoFactorAuthProps> = ({
  otpauth_url,
  base32,
  user_id,
  closeModal,
}) => {
  const [qrcodeUrl, setqrCodeUrl] = useState("");
  const store = useStore();

  const {
    handleSubmit,
    register,
    formState: { errors },
    setFocus,
  } = useForm<TwoFactorAuthInput>({
    resolver: zodResolver(twoFactorAuthSchema),
  });

  const verifyOtp = async (token: string) => {
    try {
      store.setRequestLoading(true);
      const {
        data: { user },
      } = await authApi.post<{ otp_verified: string; user: IUser }>(
        "/auth/otp/verify",
        {
          token,
          user_id,
        }
      );
      store.setRequestLoading(false);
      store.setAuthUser(user);
      closeModal();
      toast.success("Two-Factor Auth Enabled Successfully", {
        position: "top-right",
      });
    } catch (error: any) {
      store.setRequestLoading(false);
      const resMessage =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.response.data.detail ||
        error.message ||
        error.toString();
      toast.error(resMessage, {
        position: "top-right",
      });
    }
  };

  const onSubmitHandler: SubmitHandler<TwoFactorAuthInput> = (values) => {
    verifyOtp(values.token);
  };

  useEffect(() => {
    QRCode.toDataURL(otpauth_url).then(setqrCodeUrl);
  }, []);

  useEffect(() => {
    setFocus("token");
  }, [setFocus]);
  return (
    <div
      aria-hidden={true}
      className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full bg-[#222] bg-opacity-50"
      // onClick={closeModal}
    >
      <div className="relative p-4 w-full max-w-xl h-full md:h-auto left-1/2 -translate-x-1/2">
        <div className="relative bg-white rounded-lg shadow">
          <h3 className={styles.heading3}>Two-Factor Authentication (2FA)</h3>
          {/* Modal body */}
          <div className="p-6 space-y-4">
            <h4 className={styles.heading4}>
              Configuring Google Authenticator or Authy
            </h4>
            <div className={styles.orderedList}>
              <li>
                Install Google Authenticator (IOS - Android) or Authy (IOS -
                Android).
              </li>
              <li>In the authenticator app, select "+" icon.</li>
              <li>
                Select "Scan a barcode (or QR code)" and use the phone's camera
                to scan this barcode.
              </li>
            </div>
            <div>
              <h4 className={styles.heading4}>Scan QR Code</h4>
              <div className="flex justify-center">
                <img
                  className="block w-64 h-64 object-contain"
                  src={qrcodeUrl}
                  alt="qrcode url"
                />
              </div>
            </div>
            <div>
              <h4 className={styles.heading4}>Or Enter Code Into Your App</h4>
              <p className="text-sm">SecretKey: {base32} (Base32 encoded)</p>
            </div>
            <div>
              <h4 className={styles.heading4}>Verify Code</h4>
              <p className="text-sm">
                For changing the setting, please verify the authentication code:
              </p>
            </div>
            <form onSubmit={handleSubmit(onSubmitHandler)}>
              <input
                {...register("token")}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-2/4 p-2.5"
                placeholder="Authentication Code"
              />
              <p className="mt-2 text-xs text-red-600">
                {errors.token ? errors.token.message : null}
              </p>

              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={closeModal}
                  className={styles.buttonGrey}
                >
                  Close
                </button>
                <button type="submit" className={styles.buttonBlue}>
                  Verify & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth;
