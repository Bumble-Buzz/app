const ENV_MODES = {
  DEV: 'dev', // `npm run dev` or `npm run build && npm start`
  DEV_KIND: 'dev_kind', // running in kind k8
  DEV_AWS: 'dev_aws', // running in aws k8
  STAGING: 'staging', // running in aws k8
  PROD: 'prod'
};


const isDevMode = () => {
  if (process && process.env.NEXT_PUBLIC_APP_ENV === ENV_MODES.DEV) {
    return true;
  }
  return false;
};

const isDevKindMode = () => {
  if (process && process.env.NEXT_PUBLIC_APP_ENV === ENV_MODES.DEV_KIND) {
    return true;
  }
  return false;
};

const isDevAwsMode = () => {
  if (process && process.env.NEXT_PUBLIC_APP_ENV === ENV_MODES.DEV_AWS) {
    return true;
  }
  return false;
};

const isDevStagingMode = () => {
  if (process && process.env.NEXT_PUBLIC_APP_ENV === ENV_MODES.STAGING) {
    return true;
  }
  return false;
};

const isDevProdMode = () => {
  if (process && process.env.NEXT_PUBLIC_APP_ENV === ENV_MODES.PROD) {
    return true;
  }
  return false;
};

const isK8 = () => {
  if (process && 
      (
        process.env.NEXT_PUBLIC_APP_ENV === ENV_MODES.DEV_KIND ||
        process.env.NEXT_PUBLIC_APP_ENV === ENV_MODES.DEV_KIND ||
        process.env.NEXT_PUBLIC_APP_ENV === ENV_MODES.DEV_AWS ||
        process.env.NEXT_PUBLIC_APP_ENV === ENV_MODES.STAGING ||
        process.env.NEXT_PUBLIC_APP_ENV === ENV_MODES.PROD
      )
  ) {
    return true;
  }
  return false;
};


module.exports = {
  isDevMode: isDevMode(),
  isDevKindMode: isDevKindMode(),
  isDevAwsMode: isDevAwsMode(),
  isDevStagingMode: isDevStagingMode(),
  isDevProdMode: isDevProdMode(),
  isK8: isK8()
};