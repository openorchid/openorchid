Keyboards.fy = {
  label: 'Frisian',
  shortLabel: 'Fy',
  menuLabel: 'Frysk',
  imEngine: 'latin',
  autoCorrectLanguage: 'fy',
  types: ['text', 'url', 'email', 'password'],
  lang: 'fy',
  pages: [ {   // default page
    alt: {
      a: 'âäáàæãåā',
      e: 'êéëèęėē€',
      i: 'íïìîįīĳ',
      o: 'ôóöòõœøō',
      u: 'ûúüùū',
      s: '$',
      n: 'ñń',
      l: '£',
      y: 'ýĳ¥',
      '.': ',?!;:…'
    },
    keys: [
      [
      { value: 'q' }, { value: 'w' }, { value: 'e' }, { value: 'r' },
      { value: 't' }, { value: 'y' }, { value: 'u' }, { value: 'i' },
      { value: 'o' }, { value: 'p' }
    ], [
      { value: 'a' }, { value: 's' }, { value: 'd' }, { value: 'f' },
      { value: 'g' }, { value: 'h' }, { value: 'j' }, { value: 'k' },
      { value: 'l' }
    ], [
      { value: '⇪', ratio: 1.5, keyCode: KeyEvent.DOM_VK_CAPS_LOCK },
      { value: 'z' }, { value: 'x' }, { value: 'c' }, { value: 'v' },
      { value: 'b' }, { value: 'n' }, { value: 'm' },
      { value: '⌫', ratio: 1.5, keyCode: KeyEvent.DOM_VK_BACK_SPACE }
    ], [
      { value: '&nbsp', ratio: 8, keyCode: VK_SPACE },
      { value: '↵', ratio: 2, keyCode: KeyEvent.DOM_VK_RETURN }
    ]
    ]
  }]
};
