import { useCallback, useState, useEffect } from "react";
import { AppExtensionSDK } from "@contentful/app-sdk";
import {
  Heading,
  Form,
  Workbench,
  Paragraph,
  TextField,
} from "@contentful/forma-36-react-components";
import { css } from "emotion";

export interface AppInstallationParameters {
  google_maps_api_key: string;
}

interface ConfigProps {
  sdk: AppExtensionSDK;
}

const Config = (props: ConfigProps): JSX.Element => {
  const [parameters, setParameters] = useState<AppInstallationParameters>({
    google_maps_api_key: "",
  });

  const onConfigure = useCallback(async () => {
    const currentState = await props.sdk.app.getCurrentState();

    return {
      parameters,
      targetState: currentState,
    };
  }, [parameters, props.sdk]);

  useEffect(() => {
    props.sdk.app.onConfigure(() => onConfigure());
  }, [props.sdk, onConfigure]);

  useEffect(() => {
    (async () => {
      // Get current parameters of the app.
      // If the app is not installed yet, `parameters` will be `null`.
      const currentParameters: AppInstallationParameters | null =
        await props.sdk.app.getParameters();

      if (currentParameters) {
        setParameters(currentParameters);
      }

      // Once preparation has finished, call `setReady` to hide
      // the loading screen and present the app to a user.
      props.sdk.app.setReady();
    })();
  }, [props.sdk]);

  console.log(parameters);

  return (
    <Workbench className={css({ margin: "80px" })}>
      <Form>
        <Heading>Read only field app</Heading>
        <Paragraph>
          Please enter the configuration details for the App.
        </Paragraph>
        <Form>
          <TextField
            name="google_maps_api_key"
            id="google_maps_api_key"
            width="large"
            required
            labelText="Google maps API key"
            value={parameters.google_maps_api_key}
            onChange={(event): void => {
              const target = event.target as HTMLInputElement;
              const { value } = target;
              setParameters({
                ...parameters,
                google_maps_api_key: value,
              });
            }}
          ></TextField>
        </Form>
      </Form>
    </Workbench>
  );
};

export default Config;