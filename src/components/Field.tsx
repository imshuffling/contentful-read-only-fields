// @ts-nocheck
import React, { useEffect, useState } from "react";
import { TextInput } from "@contentful/forma-36-react-components";
import { FieldExtensionSDK } from "@contentful/app-sdk";
import { BooleanEditor } from "@contentful/field-editor-boolean";
import { SingleEntryReferenceEditor } from "@contentful/field-editor-reference";
import { LocationEditor } from "@contentful/field-editor-location";

interface FieldProps {
  sdk: FieldExtensionSDK;
}

const Field: React.FC<FieldProps> = (props) => {
  const { sdk } = props;
  const [value, setValue] = useState<any>(sdk.field.getValue());
  const [publishCount, setPublishCount] = useState(
    sdk.entry.getSys().publishedCounter || 0
  );

  // If user role is Admin check
  const isUserAdmin = sdk.user.spaceMembership.admin;

  const { google_maps_api_key } = sdk.parameters.installation as any;

  console.log("sdk.parameters.installation", typeof(google_maps_api_key))

  const handleObjectUpdate = (sys: any) => {
    if (sys) {
      setPublishCount(sys.publishedCounter);
    }
  };

  useEffect(() => {
    sdk.entry.onSysChanged(handleObjectUpdate); // update publishCount
  }, [sdk.entry]);

  // Start AutoResizer at initialization of component.
  useEffect(() => {
    sdk.window.startAutoResizer();
    return () => {
      return sdk.window.stopAutoResizer();
    };
  }, [sdk.window]);

  const onExternalChange = (value: any) => {
    setValue(value);
  };

  useEffect(() => {
    const detachValueChangeHandler = sdk.field.onValueChanged(onExternalChange);
    return detachValueChangeHandler;
  }, [sdk.field]);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setValue(value);
    if (value) {
      await sdk.field.setValue(value).then((data: any) => {
        // Set value
      });
    } else {
      await sdk.field.removeValue();
    }
  };


  if (sdk.field.type === "Boolean") {
    return (
      <div
        className={
          !isUserAdmin && publishCount > 0
            ? "radio-container disabled"
            : "radio-container"
        }
      >
        <BooleanEditor field={sdk.field} isInitiallyDisabled={true} />
      </div>
    );
  }

  if (
    sdk.field.type === "Symbol" ||
    sdk.field.type === "Integer" ||
    sdk.field.type === "Number"
  ) {
    return (
      <TextInput
        width="large"
        type="text"
        id="my-field"
        disabled={!isUserAdmin && publishCount > 0 ? true : false}
        testId="my-field"
        value={value}
        onChange={onChange}
      />
    );
  }

  if (sdk.field.type === "Link") {
    return (
      <div
        className={
          !isUserAdmin && publishCount > 0 ? "single-ref disabled" : "single-ref"
        }
      >
        <SingleEntryReferenceEditor
          sdk={sdk}
          isInitiallyDisabled={isUserAdmin}
          viewType="card"
          hasCardEditActions={isUserAdmin}
          parameters={{
            instance: {
              showCreateEntityAction: isUserAdmin,
              showLinkEntityAction: isUserAdmin,
            },
          }}
        />
      </div>
    );
  }

  if (sdk.field.type === "Location") {
    return (
      <div
        className={
          !isUserAdmin && publishCount > 0 ? "location-wrap disabled" : "location-wrap single-ref"
        }
      >
        <LocationEditor
          field={props.sdk.field}
          isInitiallyDisabled={isUserAdmin}
          parameters={{
            instance: {
              googleMapsKey: google_maps_api_key,
            },
          }}
        />
      </div>
    );
  }

  return <div>Field type not supported</div>;
};

export default Field;
