import ValidateTelegramWebAppData from "@nanhanglim/validate-telegram-webapp-data";

export async function POST(request: Request) {
    const {initData, secondsToExpire} = await request.json();
    const VTWAD = new ValidateTelegramWebAppData(process.env.BOT_TOKEN as string);
    const validate = VTWAD.ValidateData(initData, secondsToExpire);
    return Response.json({
        isValid: validate.isValid,
        data: validate.data
    });
};