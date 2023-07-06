import React, { useState, useEffect } from "react";
import { Search, Image, Icon } from "semantic-ui-react";
import { getImageUrl, postSearch } from "./../../../api";
import { LockSymbol } from "../widgets/widgets";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

type SearchBoxProps = Omit<
  React.ComponentProps<typeof Search>,
  | "id"
  | "loading"
  | "minCharacters"
  | "onResultSelect"
  | "onSearchChange"
  | "resultRenderer"
  | "results"
  | "value"
>;

type SearchResult = {
  url?: string;
  externalurl?: string;
  mediaid?: string;
  mediaurl?: string;
  crc32: string;
  title: string;
  description: string;
  lockedadmin: boolean;
  lockedsuperadmin: boolean;
};

const SearchBox = (searchProps: SearchBoxProps) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [value, setValue] = useState<string>();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    let canceled = false;
    const update = async () => {
      if (!value || !value.trim()) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const accessToken = isAuthenticated
        ? await getAccessTokenSilently()
        : null;
      postSearch(accessToken, value ?? "").then((res) => {
        if (!canceled) {
          setResults(res);
          setLoading(false);
        }
      });
    };
    update();
    return () => {
      canceled = true;
    };
  }, [getAccessTokenSilently, isAuthenticated, value]);

  return (
    <Search
      id="mySearch"
      loading={loading}
      onResultSelect={(e, { result }) =>
        result.externalurl
          ? window.open(result.externalurl, "_blank")
          : navigate(result.url)
      }
      onSearchChange={(e, { value }) => {
        setValue(value);
      }}
      resultRenderer={(data) => {
        const {
          mediaid,
          crc32,
          mediaurl,
          title,
          description,
          lockedadmin,
          lockedsuperadmin,
          externalurl,
        } = data;
        let imageSrc = null;
        if (mediaid > 0) {
          imageSrc = getImageUrl(mediaid, crc32, 45);
        } else if (mediaurl) {
          imageSrc = mediaurl;
        }
        if (externalurl) {
          return (
            <>
              <div className="image">
                <Icon name="external" />
              </div>
              <div className="content">
                {title && (
                  <div className="title">
                    <i>{title}</i>
                  </div>
                )}
                {description && (
                  <div className="description">
                    <i>{description}</i>
                  </div>
                )}
              </div>
            </>
          );
        }
        return (
          <>
            <div className="image">
              {imageSrc && (
                <Image
                  style={{ objectFit: "cover", width: "45px", height: "45px" }}
                  src={imageSrc}
                />
              )}
            </div>
            <div className="content">
              {title && (
                <div className="title">
                  {title}{" "}
                  <LockSymbol
                    lockedAdmin={lockedadmin === "true"}
                    lockedSuperadmin={lockedsuperadmin === "true"}
                  />
                </div>
              )}
              {description && <div className="description">{description}</div>}
            </div>
          </>
        );
      }}
      minCharacters={1}
      results={results.map((s) => ({
        key: s.url || s.externalurl,
        url: s.url,
        externalurl: s.externalurl,
        mediaid: s.mediaid,
        mediaurl: s.mediaurl,
        crc32: s.crc32,
        title: s.title,
        description: s.description,
        lockedadmin: String(s.lockedadmin),
        lockedsuperadmin: String(s.lockedsuperadmin),
      }))}
      value={value}
      {...searchProps}
    />
  );
};

export default SearchBox;
