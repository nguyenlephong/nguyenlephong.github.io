import React, {useEffect, useState} from "react";

import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookMessengerIcon,
  FacebookMessengerShareButton,
  FacebookShareButton,
  FacebookShareCount,
  HatenaIcon,
  HatenaShareButton,
  HatenaShareCount,
  InstapaperIcon,
  InstapaperShareButton,
  LineIcon,
  LineShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  LivejournalIcon,
  LivejournalShareButton,
  MailruIcon,
  MailruShareButton,
  OKIcon,
  OKShareButton,
  OKShareCount,
  PinterestIcon,
  PinterestShareButton,
  PinterestShareCount,
  PocketIcon,
  PocketShareButton,
  RedditIcon,
  RedditShareButton,
  RedditShareCount,
  TelegramIcon,
  TelegramShareButton,
  TumblrIcon,
  TumblrShareButton,
  TumblrShareCount,
  TwitterIcon,
  TwitterShareButton,
  ViberIcon,
  ViberShareButton,
  VKIcon,
  VKShareButton,
  VKShareCount,
  WeiboIcon,
  WeiboShareButton,
  WhatsappIcon,
  WhatsappShareButton,
  WorkplaceIcon,
  WorkplaceShareButton,
} from "react-share";

import {APP_CONFIGS} from "../../lib/config/config-app";

const ButtonShareContainer = (props) => {

  const [url, setUrl] = useState();
  const [title, setTitle] = useState();
  // const [description, setDescription] = useState();
  const [thumbnail, setThumbnail] = useState();
  // const [listButton, setListButton] = useState();

  useEffect(() => {
    setUrl(props.url ? props.url : window.location.href)
  }, [props.url])

  useEffect(() => {
    setTitle(props.title)
  }, [props.title])

  useEffect(() => {
    setThumbnail(props.thumbnail ? props.thumbnail : "https://cdn.jsdelivr.net/gh/nguyenlephong/dom-pub/shared/images/cv/images/dom220.png")
  }, [props.thumbnail])

  // useEffect(() => {
  //   setDescription(props.description)
  // }, [props.description])

  // useEffect(() => {
  //   setListButton(props.listButton)
  // }, [props.listButton])



  return (
    <div className="button_share__container btn-shares">
      <div className="button_share__some-network">
        <FacebookShareButton
          url={url}
          quote={title}
          className="button_share__some-network__share-button"
        >
          <FacebookIcon size={32} round/>
        </FacebookShareButton>

        <div>
          <FacebookShareCount url={url} className="button_share__some-network__share-count">
            {count => count}
          </FacebookShareCount>
        </div>
      </div>

      <div className="button_share__some-network">
        <FacebookMessengerShareButton
          url={url}
          appId={APP_CONFIGS.FB_APP_ID}
          className="button_share__some-network__share-button"
        >
          <FacebookMessengerIcon size={32} round/>
        </FacebookMessengerShareButton>
      </div>

      <div className="button_share__some-network">
        <TwitterShareButton
          url={url}
          title={title}
          className="button_share__some-network__share-button"
        >
          <TwitterIcon size={32} round/>
        </TwitterShareButton>

        <div className="button_share__some-network__share-count">&nbsp;</div>
      </div>

      <div className="button_share__some-network">
        <TelegramShareButton
          url={url}
          title={title}
          className="button_share__some-network__share-button"
        >
          <TelegramIcon size={32} round/>
        </TelegramShareButton>

        <div className="button_share__some-network__share-count">&nbsp;</div>
      </div>

      <div className="button_share__some-network">
        <WhatsappShareButton
          url={url}
          title={title}
          separator=":: "
          className="button_share__some-network__share-button"
        >
          <WhatsappIcon size={32} round/>
        </WhatsappShareButton>

        <div className="button_share__some-network__share-count">&nbsp;</div>
      </div>

      <div className="button_share__some-network">
        <LinkedinShareButton url={url} className="button_share__some-network__share-button">
          <LinkedinIcon size={32} round/>
        </LinkedinShareButton>
      </div>

      <div className="button_share__some-network">
        <PinterestShareButton
          url={String(window.location)}
          media={`${String(window.location)}/${thumbnail}`}
          className="button_share__some-network__share-button"
        >
          <PinterestIcon size={32} round/>
        </PinterestShareButton>

        <div>
          <PinterestShareCount url={url} className="button_share__some-network__share-count"/>
        </div>
      </div>

      <div className="button_share__some-network">
        <VKShareButton
          url={url}
          image={`${String(window.location)}/${thumbnail}`}
          className="button_share__some-network__share-button"
        >
          <VKIcon size={32} round/>
        </VKShareButton>

        <div>
          <VKShareCount url={url} className="button_share__some-network__share-count"/>
        </div>
      </div>

      <div className="button_share__some-network">
        <OKShareButton
          url={url}
          image={`${String(window.location)}/${thumbnail}`}
          className="button_share__some-network__share-button"
        >
          <OKIcon size={32} round/>
        </OKShareButton>

        <div>
          <OKShareCount url={url} className="button_share__some-network__share-count"/>
        </div>
      </div>

      <div className="button_share__some-network">
        <RedditShareButton
          url={url}
          title={title}
          windowWidth={660}
          windowHeight={460}
          className="button_share__some-network__share-button"
        >
          <RedditIcon size={32} round/>
        </RedditShareButton>

        <div>
          <RedditShareCount url={url} className="button_share__some-network__share-count"/>
        </div>
      </div>

      <div className="button_share__some-network">
        <TumblrShareButton
          url={url}
          title={title}
          className="button_share__some-network__share-button"
        >
          <TumblrIcon size={32} round/>
        </TumblrShareButton>

        <div>
          <TumblrShareCount url={url} className="button_share__some-network__share-count"/>
        </div>
      </div>

      <div className="button_share__some-network">
        <LivejournalShareButton
          url={url}
          title={title}
          description={url}
          className="button_share__some-network__share-button"
        >
          <LivejournalIcon size={32} round/>
        </LivejournalShareButton>
      </div>

      <div className="button_share__some-network">
        <MailruShareButton
          url={url}
          title={title}
          className="button_share__some-network__share-button"
        >
          <MailruIcon size={32} round/>
        </MailruShareButton>
      </div>

      <div className="button_share__some-network">
        <EmailShareButton
          url={url}
          subject={title}
          body="body"
          className="button_share__some-network__share-button"
        >
          <EmailIcon size={32} round/>
        </EmailShareButton>
      </div>
      <div className="button_share__some-network">
        <ViberShareButton
          url={url}
          title={title}
          className="button_share__some-network__share-button"
        >
          <ViberIcon size={32} round/>
        </ViberShareButton>
      </div>

      <div className="button_share__some-network">
        <WorkplaceShareButton
          url={url}
          quote={title}
          className="button_share__some-network__share-button"
        >
          <WorkplaceIcon size={32} round/>
        </WorkplaceShareButton>
      </div>

      <div className="button_share__some-network">
        <LineShareButton
          url={url}
          title={title}
          className="button_share__some-network__share-button"
        >
          <LineIcon size={32} round/>
        </LineShareButton>
      </div>

      <div className="button_share__some-network">
        <WeiboShareButton
          url={url}
          title={title}
          image={`${String(window.location)}/${thumbnail}`}
          className="button_share__some-network__share-button"
        >
          <WeiboIcon size={32} round/>
        </WeiboShareButton>
      </div>

      <div className="button_share__some-network">
        <PocketShareButton
          url={url}
          title={title}
          className="button_share__some-network__share-button"
        >
          <PocketIcon size={32} round/>
        </PocketShareButton>
      </div>

      <div className="button_share__some-network">
        <InstapaperShareButton
          url={url}
          title={title}
          className="button_share__some-network__share-button"
        >
          <InstapaperIcon size={32} round/>
        </InstapaperShareButton>
      </div>

      <div className="button_share__some-network">
        <HatenaShareButton
          url={url}
          title={title}
          windowWidth={660}
          windowHeight={460}
          className="button_share__some-network__share-button"
        >
          <HatenaIcon size={32} round/>
        </HatenaShareButton>

        <div>
          <HatenaShareCount url={url} className="button_share__some-network__share-count"/>
        </div>
      </div>
    </div>


  )
}

export default ButtonShareContainer;