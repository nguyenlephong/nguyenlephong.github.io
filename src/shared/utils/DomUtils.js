export const scrollToTopByRef = (ref) => {
  ref && ref.current.scrollIntoView({
    x: 0, behavior: 'smooth', top: ref?.current?.offsetTop
  });
};

export const scrollToBottomByRef = (ref) => {
  ref && ref.current.scrollIntoView({
    x: 0, behavior: 'smooth', top: ref?.current?.offsetBottom
  });
};

export const scrollCheckLoadMore = (ref, x, y, bottomRefs) => {
  let scrollTop = ref?.current?.scrollTop;
  let clientHeight = ref?.current?.clientHeight;
  let scrollHeight = ref?.current?.scrollHeight;
  if (scrollTop + clientHeight === scrollHeight) {
    console.log('---------------------------------------------Load more---------------------------------------------');
    return true;
  }
};
export const copyToClipboardLargeData = (value) => {
  let contentToCopy;

  function copyDataToClipboard(e) {
    e.preventDefault(); // default behaviour is to copy any selected text
    e.clipboardData.setData("text/plain", contentToCopy);
  }

  function copy(content) {
    contentToCopy = content;
    document.addEventListener("copy", copyDataToClipboard);
    try {
      document.execCommand("copy");
    } catch (exception) {
      console.error("Copy to clipboard failed");
    } finally {
      document.removeEventListener("copy", copyDataToClipboard);
    }
  }

  copy(value);
}
export const copyToClipboard = (value) => {
  const el = document.createElement('textarea');
  el.value = value;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};