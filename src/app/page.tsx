"use client"
import Link from "next/link";
import { memo, useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState('loading');
  const [initData, setInitData] = useState('');
  const [authDate, setAuthDate] = useState(0);
  const [secondsSinceData, setSecondsSinceData] = useState(0);
  const [secondsToExpire, setSecondsToExpire] = useState(15);
  const [isValid, setIsValid] = useState(true);
  useEffect(() => {
    try {
      (window as any).Telegram.WebApp.expand();
      const webAppInitData = (window as any).Telegram.WebApp.initData;
      if (webAppInitData) {
        setInitData(webAppInitData);
        setStatus('loaded');
      } else {
        setStatus('notTelegramApp');
      };
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentDate = Date.now() / 1000;
      setSecondsSinceData(currentDate - authDate);
    }, 1000);
    return () =>  clearInterval(interval);
  }, [authDate])

  useEffect(() => {
    if (status === 'loaded') {
      fetch("/api/ValidateData", {
        method: "POST",
        body: JSON.stringify({
          initData,
          secondsToExpire
        })
      })
        .then(async res => {
          const result = await res.json();
          const authDateRetrieved = result.data.auth_date;
          authDate ? '' : setAuthDate(authDateRetrieved);
          setIsValid(result.isValid);
        })
        .catch(err => {
          setStatus(`Error: ${err.message}`);
        });
    };
  }, [secondsSinceData, initData]);

  const DemoImage = memo(() => <img src="/demoBtn.jpeg" style={{ width: '100%', height: 'auto' }} alt="Demo button on the left of the Attachment button, highlighted by a red box" />);
  DemoImage.displayName = "DemoImage";

  const Content = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-row items-center" role="status">
            <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
            </svg>
            <span className="font-bold ml-2">Loading...</span>
          </div>
        )
      case 'loaded':
        return (
          <>
            <div className="mt-5">
              <p className="font-bold">InitData</p>
              <textarea rows={10} className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" value={initData} onChange={e => setInitData(e.target.value)} />
              <p id="helper-text-explanation" className="mt-2 text-sm">Modify to tamper with InitData</p>
            </div>
            <div className="mt-5">
              <p className="font-bold">Seconds since InitData created</p>
              <p className="text-wrap break-all">{secondsSinceData < authDate ? secondsSinceData|0 : "Retrieving..."}</p>
              <p id="helper-text-explanation" className="mt-2 text-sm">Please allow for some time difference due to network latency.</p>
            </div>
            <div className="mt-5">
              <div className="sm:col-span-3 mt-2">
                <label htmlFor="secondsToExpiry" className="font-bold">Set seconds to expire</label>
                <div className="mt-2">
                  <input type="number" name="secondsToExpire" id="secondsToExpire" className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" value={secondsToExpire} onChange={e => setSecondsToExpire(parseInt(e.target.value))} />
                  <p id="helper-text-explanation" className="mt-2 text-sm">To disable expiration check, set to 0</p>
                </div>
              </div>
            </div>
            <div className={`flex justify-center items-center mt-5 p-3`}>
              <p className="font-bold">{isValid ? "✓ InitData is valid and current" : "✕ InitData is invalid or has expired"}</p>
            </div>
          </>
        )
      case 'notTelegramApp':
        return (
          <>
            <p>This demo only works in Telegram.</p>
            <p>Start a chat with <Link className="underline" href="https://t.me/WebAppDataDemoBot">@WebAppDataDemoBot</Link> on Telegram and tap on the &quot;Demo&quot; button.</p>
            <DemoImage />
          </>
        )
      default:
        return (
          <p className="text-red-500">{status}</p>
        )
    };
  };

  return (
    <div className={`min-h-screen ${status === 'loaded' ? isValid ? "bg-green-600" : "bg-red-600" : ''}`}>
      <div className={`flex flex-col flex-wrap p-5 justify-center items-center`}>
        <div>
          <h2 className="text-2xl font-bold leading-7 sm:truncate sm:text-3xl sm:tracking-tight">Telegram WebApp Data Demo</h2>
          <p className="mt-2 mb-5">Using the <Link className="underline" href="https://www.npmjs.com/package/@nanhanglim/validate-telegram-webapp-data">@nanhanglim/validate-telegram-webapp-data</Link> npm package, this demo app checks if InitData received is valid and current.</p>
          {Content()}
        </div>
      </div>
    </div>
  );
};
