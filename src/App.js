import { useEffect, useState, useRef } from 'react'
import { letters, status } from './constants'
import { Keyboard } from './components/Keyboard'
import new_words from './data/new_words'

import { useLocalStorage } from './hooks/useLocalStorage'
import { ReactComponent as Info } from './data/Info.svg'
import { ReactComponent as Settings } from './data/Settings.svg'
import { ReactComponent as Share } from './data/Share.svg'

import { InfoModal } from './components/InfoModal'
import { SettingsModal } from './components/SettingsModal'
import { EndGameModal } from './components/EndGameModal'
import { ChallengeInputModal } from './components/ChallengeInputModal'
import { Menu, Transition } from '@headlessui/react'

export const challengeDifficultyLevel = {
  normal: 'wordle',
  hard: 'any'
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const state = {
  playingChallenge: 'playingChallenge',
  playing: 'playing',
  creating: 'creating',
  created: 'created',
  won: 'won',
  lost: 'lost',
  challenge_won: 'challenge won',
  challenge_lost: 'challenge lost'
}

const getDayAnswer = (day_) => {
  return wordle_answers[day_-1].toUpperCase()
}
const getDayAnswerWithIndex = (index) => {
  if (index < new_words.length) { return new_words[index].toUpperCase() }
  return ""
}

// Set the day number of the puzzle to display and show it as the address bar query string

const setDay = newDay => {
  if (wordIndex < 0) {
    if (newDay < 1 || newDay > og_day) {
      newDay = og_day; 
    }
    day = newDay;
    var word = getDayAnswer(day);
    wordIndex = new_words.indexOf(word.toLowerCase());
    console.log('wordIndex set to '+wordIndex);
  }
  window.history.pushState({}, '', '?wi=' + wordIndex);
};

const getDay = (og_day) => {
  const { search } = document.location;
  var url_day = og_day
  if (search) {
    const urlParams = new URLSearchParams(search);
    var i = urlParams.get('wi');
    if ( i && i > 0 || i < new_words.length ) {
      wordIndex = i;
      console.log('wordIndex set to '+wordIndex);
      if (getDayAnswer(og_day).toLowerCase() == new_words[wordIndex]){
        day = og_day;
        return og_day;
      }
      return -1;
    }  
    if (isNaN(search.slice(1))) {
      url_day = og_day
    } else {
      url_day = parseInt(search.slice(1), 10);
    }
    if (url_day > og_day || url_day < 1) {
      url_day = og_day
    }
    return url_day
  }
  else {
    return og_day
  }
}

const getWordIndex = (og_day) => {
  const { search } = document.location;
  const urlParams = new URLSearchParams(search);
  const word_index = urlParams.get('wi');
  var url_day = og_day
  if (search) {
    if (isNaN(search.slice(1))) {
      url_day = og_day
    } else {
      url_day = parseInt(search.slice(1), 10);
    }
    if (url_day > og_day || url_day < 1) {
      url_day = og_day
    }
    return url_day
  }
  else {
    return og_day
  }
}

const getOGDay = () => {
  const today = new Date()
  const date1 = new Date('6/21/21')
  const diffTime = Math.abs(today - date1)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

const wordle_answers = ["rebut", "sissy", "humph", "awake", "blush", "focal", "evade", "naval", "serve", "heath", "dwarf", "model", "karma", "stink", "grade", "quiet", "bench", "abate", "feign", "major", "death", "fresh", "crust", "stool", "colon", "abase", "marry", "react", "batty", "pride", "floss", "helix", "croak", "staff", "paper", "unfed", "whelp", "trawl", "outdo", "adobe", "crazy", "sower", "repay", "digit", "crate", "cluck", "spike", "mimic", "pound", "maxim", "linen", "unmet", "flesh", "booby", "forth", "first", "stand", "belly", "ivory", "seedy", "print", "yearn", "drain", "bribe", "stout", "panel", "crass", "flume", "offal", "agree", "error", "swirl", "argue", "bleed", "delta", "flick", "totem", "wooer", "front", "shrub", "parry", "biome", "lapel", "start", "greet", "goner", "golem", "lusty", "loopy", "round", "audit", "lying", "gamma", "labor", "islet", "civic", "forge", "corny", "moult", "basic", "salad", "agate", "spicy", "spray", "essay", "fjord", "spend", "kebab", "guild", "aback", "motor", "alone", "hatch", "hyper", "thumb", "dowry", "ought", "belch", "dutch", "pilot", "tweed", "comet", "jaunt", "enema", "steed", "abyss", "growl", "fling", "dozen", "boozy", "erode", "world", "gouge", "click", "briar", "great", "altar", "pulpy", "blurt", "coast", "duchy", "groin", "fixer", "group", "rogue", "badly", "smart", "pithy", "gaudy", "chill", "heron", "vodka", "finer", "surer", "radio", "rouge", "perch", "retch", "wrote", "clock", "tilde", "store", "prove", "bring", "solve", "cheat", "grime", "exult", "usher", "epoch", "triad", "break", "rhino", "viral", "conic", "masse", "sonic", "vital", "trace", "using", "peach", "champ", "baton", "brake", "pluck", "craze", "gripe", "weary", "picky", "acute", "ferry", "aside", "tapir", "troll", "unify", "rebus", "boost", "truss", "siege", "tiger", "banal", "slump", "crank", "gorge", "query", "drink", "favor", "abbey", "tangy", "panic", "solar", "shire", "proxy", "point", "robot", "prick", "wince", "crimp", "knoll", "sugar", "whack", "mount", "perky", "could", "wrung", "light", "those", "moist", "shard", "pleat", "aloft", "skill", "elder", "frame", "humor", "pause", "ulcer", "ultra", "robin", "cynic", "aroma", "caulk", "shake", "dodge", "swill", "tacit", "other", "thorn", "trove", "bloke", "vivid", "spill", "chant", "choke", "rupee", "nasty", "mourn", "ahead", "brine", "cloth", "hoard", "sweet", "month", "lapse", "watch", "today", "focus", "smelt", "tease", "cater", "movie", "saute", "allow", "renew", "their", "slosh", "purge", "chest", "depot", "epoxy", "nymph", "found", "shall", "harry", "stove", "lowly", "snout", "trope", "fewer", "shawl", "natal", "comma", "foray", "scare", "stair", "black", "squad", "royal", "chunk", "mince", "shame", "cheek", "ample", "flair", "foyer", "cargo", "oxide", "plant", "olive", "inert", "askew", "heist", "shown", "zesty", "hasty", "trash", "fella", "larva", "forgo", "story", "hairy", "train", "homer", "badge", "midst", "canny", "fetus", "butch", "farce", "slung", "tipsy", "metal", "yield", "delve", "being", "scour", "glass", "gamer", "scrap", "money", "hinge", "album", "vouch", "asset", "tiara", "crept", "bayou", "atoll", "manor", "creak", "showy", "phase", "froth", "depth", "gloom", "flood", "trait", "girth", "piety", "payer", "goose", "float", "donor", "atone", "primo", "apron", "blown", "cacao", "loser", "input", "gloat", "awful", "brink", "smite", "beady", "rusty", "retro", "droll", "gawky", "hutch", "pinto", "gaily", "egret", "lilac", "sever", "field", "fluff", "hydro", "flack", "agape", "voice", "stead", "stalk", "berth", "madam", "night", "bland", "liver", "wedge", "augur", "roomy", "wacky", "flock", "angry", "bobby", "trite", "aphid", "tryst", "midge", "power", "elope", "cinch", "motto", "stomp", "upset", "bluff", "cramp", "quart", "coyly", "youth", "rhyme", "buggy", "alien", "smear", "unfit", "patty", "cling", "glean", "label", "hunky", "khaki", "poker", "gruel", "twice", "twang", "shrug", "treat", "unlit", "waste", "merit", "woven", "octal", "needy", "clown", "widow", "irony", "ruder", "gauze", "chief", "onset", "prize", "fungi", "charm", "gully", "inter", "whoop", "taunt", "leery", "class", "theme", "lofty", "tibia", "booze", "alpha", "thyme", "eclat", "doubt", "parer", "chute", "stick", "trice", "alike", "sooth", "recap", "saint", "liege", "glory", "grate", "admit", "brisk", "soggy", "usurp", "scald", "scorn", "leave", "twine", "sting", "bough", "marsh", "sloth", "dandy", "vigor", "howdy", "enjoy"]
var day = -1;
var wordIndex = -1;
const og_day = getOGDay()
setDay(getDay(og_day));


function App() {

  const reloadCount = Number(sessionStorage.getItem('reloadCount')) || 0;

  const initialStates = {
    answer: () => getDayAnswerWithIndex(wordIndex),
    gameState: state.playing,
    board: [
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
    ],
    cellStatuses: () => Array(6).fill(Array(5).fill(status.unguessed)),
    currentRow: 0,
    currentCol: 0,
    letterStatuses: () => {
      const letterStatuses = {}
      letters.forEach((letter) => {
        letterStatuses[letter] = status.unguessed
      })
      return letterStatuses
    },
  }

  const [answer, setAnswer] = useState(initialStates.answer)
  const [gameState, setGameState] = useState(initialStates.gameState)
  const [gameStateList, setGameStateList] = useLocalStorage('gameStateList', Array(800).fill('0'))
  const [board, setBoard] = useState(initialStates.board)
  const [cellStatuses, setCellStatuses] = useState(initialStates.cellStatuses)
  const [currentRow, setCurrentRow] = useState(initialStates.currentRow)
  const [currentCol, setCurrentCol] = useState(initialStates.currentCol)
  const [letterStatuses, setLetterStatuses] = useState(initialStates.letterStatuses)
  const [submittedInvalidWord, setSubmittedInvalidWord] = useState(false)
  const [currentStreak, setCurrentStreak] = useLocalStorage('current-streak', 0)
  const [longestStreak, setLongestStreak] = useLocalStorage('longest-streak', 0)
  const streakUpdated = useRef(false)
  const [modalIsOpen, setIsOpen] = useState(false)
  const [firstTime, setFirstTime] = useLocalStorage('first-time', true)
  const [infoModalIsOpen, setInfoModalIsOpen] = useState(firstTime)
  const [settingsModalIsOpen, setSettingsModalIsOpen] = useState(false)
  const [challengeInputModalIsOpen, setChallengeInputModalIsOpen] = useState(false)
  const [challengeDifficulty, setChallengeDifficulty] = useLocalStorage('challengeDifficulty', challengeDifficultyLevel.normal)
  

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)
  const handleInfoClose = () => {
    setFirstTime(false)
    setInfoModalIsOpen(false)
  }

  const [darkMode, setDarkMode] = useLocalStorage('dark-mode', false)
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev)
  }

  const [colorBlindMode, setColorblindMode] = useLocalStorage('colorblind-mode', false)
  const toggleColorBlindMode = () => {
    setColorblindMode((prev) => !prev)
  }

  const [challengePlayInStrict, setChallengePlayInStrict] = useLocalStorage('challengePlayInStrict', true)
  const toggleChallengePlayInStrict = () => {
    setChallengePlayInStrict((prev) => !prev)
  }

  //const [exactGuesses, setExactGuesses] = useLocalStorage('exact-guesses', {})
  const [exactGuesses, setExactGuesses] = useState({})

  useEffect(() => {
    if (gameState == state.won || gameState == state.lost || gameState == state.created) {
      setTimeout(() => {
        openModal()
      }, 500)
    }
  }, [gameState])

  useEffect(() => {
    if (!streakUpdated.current) {
      if (gameState === state.won) {
        if (currentStreak >= longestStreak) {
          setLongestStreak((prev) => prev + 1)
        }
        setCurrentStreak((prev) => prev + 1)
        streakUpdated.current = true
      } else if (gameState === state.lost) {
        setCurrentStreak(0)
        streakUpdated.current = true
      }
    }
  }, [gameState, currentStreak, longestStreak, setLongestStreak, setCurrentStreak])

  useEffect(() => {
    if (localStorage.getItem('gameStateList') == null) {
      setGameStateList(gameStateList)
    }
  }, [])

  useEffect(() => {
    if (reloadCount < 1) {
      window.location.reload(true);
      sessionStorage.setItem('reloadCount', String(reloadCount + 1));
    } else {
      sessionStorage.removeItem('reloadCount');
    }
  }, [og_day])

  const getCellStyles = (rowNumber, colNumber, letter) => {
    if (rowNumber === currentRow) {
      if (letter) {
        return `nm-inset-background dark:nm-inset-background-dark text-primary dark:text-primary-dark ${
          submittedInvalidWord ? 'border border-red-800' : ''
        }`
      }
      return 'nm-flat-background dark:nm-flat-background-dark text-primary dark:text-primary-dark'
    }

    switch (cellStatuses[rowNumber][colNumber]) {
      case status.green:
        if (colorBlindMode) {
          return 'nm-inset-orange-500 text-gray-50'
        }
        else {
          return 'nm-inset-n-green text-gray-50'
        }
      case status.yellow:
      if (colorBlindMode) {
        return 'nm-inset-blue-300 text-gray-50'
      }
      else {
        return 'nm-inset-yellow-500 text-gray-50'
      }
      case status.gray:
        return 'nm-inset-n-gray text-gray-50'
      default:
        return 'nm-flat-background dark:nm-flat-background-dark text-primary dark:text-primary-dark'
    }
  }

  const addLetter = (letter) => {
    //window.scrollTo(0,document.body.scrollHeight)
    document.activeElement.blur()
    setSubmittedInvalidWord(false)
    setBoard((prev) => {
      if (currentCol > 4) {
        return prev
      }
      const newBoard = [...prev]
      newBoard[currentRow][currentCol] = letter
      return newBoard
    })
    if (currentCol < 5) {
      setCurrentCol((prev) => prev + 1)
    }
  }
  const createNew = () => {
    console.log('creating new challenge')
    setCellStatuses(initialStates.cellStatuses)
    setLetterStatuses(initialStates.letterStatuses)
    setGameState(state.creating)
    setCurrentRow(initialStates.currentRow)
    setCurrentCol(initialStates.currentCol)
    setSubmittedInvalidWord(false)
    setExactGuesses({})
    const newBoard = [
      ['', '', '', '', ''],
    ];

    setBoard((prev)=>{
      return newBoard
    })
  }

  const playChallengeHandle = () => {
    setChallengeInputModalIsOpen(true)
    setGameState(state.playingChallenge)
  }

  const challengeInputModalCloseHandle = () => {
    setChallengeInputModalIsOpen(false)
    setGameState(state.playing)
  }

  const onChallengeInputSubmit = (val) => {
    console.log('Playing Challenge: '+val);
    //challengeInputModalCloseHandle();
    // do things here for playing challenge chosen
    //playIndex(val)
    window.open(val,"_self")
  };
 

  const isValidWord = (word) => {
    if (word.length < 5) return false
    var validWord = new_words.indexOf(word.toLowerCase()) >= 0
    if (!validWord) return false
    if (gameState == state.creating) {
      if (challengeDifficulty == challengeDifficultyLevel.hard) return true;
      else return wordle_answers.indexOf(word.toLowerCase()) >= 0
    }
    if (!challengePlayInStrict) return true;
    const guessedLetters = Object.entries(letterStatuses).filter(([letter, letterStatus]) =>
      [status.yellow, status.green].includes(letterStatus)
    )
    const yellowsUsed = guessedLetters.every(([letter, _]) => word.includes(letter))
    const greensUsed = Object.entries(exactGuesses).every(
      ([position, letter]) => word[parseInt(position)] === letter
    )
    if (!yellowsUsed || !greensUsed) return false
    return true
  }

  const onEnterPress = () => {
    const word = board[currentRow].join('')
    if (!isValidWord(word)) {
      setSubmittedInvalidWord(true)
      return
    }

    if (gameState == state.creating) {
      //setCellStatuses(Array(1).fill(Array(5).fill(status.green)))
      localStorage.setItem('challengeWord', JSON.stringify(word))
      localStorage.setItem('challengeIndex', JSON.stringify(new_words.indexOf(word.toLowerCase())))
      setGameState(state.created)
      return
    }

    if (currentRow === 6) return
    
    updateCellStatuses(word, currentRow)
    updateLetterStatuses(word)
    setCurrentRow((prev) => prev + 1)
    setCurrentCol(0)
  }

  const onDeletePress = () => {
    setSubmittedInvalidWord(false)
    if (currentCol === 0) return

    setBoard((prev) => {
      const newBoard = [...prev]
      newBoard[currentRow][currentCol - 1] = ''
      return newBoard
    })

    setCurrentCol((prev) => prev - 1)
  }

  const updateCellStatuses = (word, rowNumber) => {
    const fixedLetters = {}
    setCellStatuses((prev) => {
      const newCellStatuses = [...prev]
      newCellStatuses[rowNumber] = [...prev[rowNumber]]
      const wordLength = word.length
      const answerLetters = answer.split('')

      // set all to gray
      for (let i = 0; i < wordLength; i++) {
        newCellStatuses[rowNumber][i] = status.gray
      }

      // check greens
      for (let i = wordLength - 1; i >= 0; i--) {
        if (word[i] === answer[i]) {
          newCellStatuses[rowNumber][i] = status.green
          answerLetters.splice(i, 1)
          fixedLetters[i] = answer[i]
        }
      }

      // check yellows
      for (let i = 0; i < wordLength; i++) {
        if (answerLetters.includes(word[i]) && newCellStatuses[rowNumber][i] !== status.green) {
          newCellStatuses[rowNumber][i] = status.yellow
          answerLetters.splice(answerLetters.indexOf(word[i]), 1)
        }
      }

      return newCellStatuses
    })
    setExactGuesses((prev) => ({ ...prev, ...fixedLetters }))
  }

  const isRowAllGreen = (row) => {
    return row.every((cell) => cell === status.green)
  }

  // every time cellStatuses updates, check if the game is won or lost
  useEffect(() => {
    if (gameState !== state.playing && gameState !== state.playingChallenge) return
    const cellStatusesCopy = [...cellStatuses]
    const reversedStatuses = cellStatusesCopy.reverse()
    const lastFilledRow = reversedStatuses.find((r) => {
      return r[0] !== status.unguessed
    })
    const updateChallengeStatus = (arr, idx) => {
      var count = Number(arr[500]);
      for (var i=0; i < count; i++) {
        if (Math.abs(arr[501+i]) == Math.abs(idx)) {
          arr[501+i] = idx.toString()
          return;
        }
      }
      arr[501 + count] = idx.toString()
      arr[500] = (count + 1).toString()
    }

    if (lastFilledRow && isRowAllGreen(lastFilledRow)) {
      setGameState(state.won)
      var newGameStateList = JSON.parse(localStorage.getItem('gameStateList'))
      var count = Number(newGameStateList[500]);
      if (day < 0) {
        //newGameStateList[501+count] = wordIndex.toString();
        //newGameStateList[500] = (count+1).toString();
        updateChallengeStatus(newGameStateList, wordIndex);
      } else {
        newGameStateList[day-1] = state.won
      }
      localStorage.setItem('gameStateList', JSON.stringify(newGameStateList))
    } else if (currentRow === 6) {
      setGameState(state.lost)
      var newGameStateList = JSON.parse(localStorage.getItem('gameStateList'))
      if (day < 0) {
        //newGameStateList[501+count] = (wordIndex*(-1)).toString();
        //newGameStateList[500] = (count+1).toString();
        updateChallengeStatus(newGameStateList, (wordIndex*-1));
      } else {
        newGameStateList[day-1] = state.lost
      }
      localStorage.setItem('gameStateList', JSON.stringify(newGameStateList))
    }
  }, [cellStatuses, currentRow])

  const updateLetterStatuses = (word) => {
    setLetterStatuses((prev) => {
      const newLetterStatuses = { ...prev }
      const wordLength = word.length
      for (let i = 0; i < wordLength; i++) {
        if (newLetterStatuses[word[i]] === status.green) continue

        if (word[i] === answer[i]) {
          newLetterStatuses[word[i]] = status.green
        } else if (answer.includes(word[i])) {
          newLetterStatuses[word[i]] = status.yellow
        } else {
          newLetterStatuses[word[i]] = status.gray
        }
      }
      return newLetterStatuses
    })
  }

  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: darkMode ? 'hsl(231, 16%, 25%)' : 'hsl(231, 16%, 92%)',
    },
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      transform: 'translate(-50%, -50%)',
      height: 'calc(100% - 2rem)',
      width: 'calc(100% - 2rem)',
      backgroundColor: darkMode ? 'hsl(231, 16%, 25%)' : 'hsl(231, 16%, 92%)',
      boxShadow: `${
        darkMode
          ? '0.2em 0.2em calc(0.2em * 2) #252834, calc(0.2em * -1) calc(0.2em * -1) calc(0.2em * 2) #43475C'
          : '0.2em 0.2em calc(0.2em * 2) #A3A7BD, calc(0.2em * -1) calc(0.2em * -1) calc(0.2em * 2) #FFFFFF'
      }`,
      border: 'none',
      borderRadius: '1rem',
      maxWidth: '475px',
      maxHeight: '650px',
      position: 'relative',
    },
  }

  const play = () => {
    setAnswer(initialStates.answer)
    setGameState(initialStates.gameState)
    setBoard(initialStates.board)
    setCellStatuses(initialStates.cellStatuses)
    setCurrentRow(initialStates.currentRow)
    setCurrentCol(initialStates.currentCol)
    setLetterStatuses(initialStates.letterStatuses)
    setExactGuesses({})
  }
  const playFirst = () => playDay(1)
  const playPrevious = () => playDay(day - 1)
  const playRandom = () => playDay(Math.floor(Math.random() * (og_day-1)) + 1)
  const playNext = () => playDay(day + 1)
  const playLast = () => playDay(og_day)

  const playDay = (i) => {
    day = i;
    var word = getDayAnswer(i);
    wordIndex = new_words.indexOf(word.toLowerCase());
    setDay(i)
    play()
  }

  const playIndex = (i) => {
    if (i >= 0 || i < new_words.length) {
      wordIndex = i;
      day = -1;
      setDay(i)
      play()
    }
  }

  var tempGameStateList = JSON.parse(localStorage.getItem('gameStateList'))
  if (tempGameStateList == null) {
    setGameStateList(gameStateList)
    tempGameStateList = gameStateList
  }
  for (var i=4;i<=og_day+3;i++) {
    var textNumber = document.getElementById('headlessui-menu-item-'+i)
    if(textNumber != null) {
      if (tempGameStateList[i-1] == state.won) {
        textNumber.classList.add('green-text');
      }
      if (tempGameStateList[i-1] == state.lost) {
        textNumber.classList.add('red-text');
      }
    }
  }

  if ( day > 0) {
    var header_symbol = (tempGameStateList[day-1] == 'won') ? ('✔') : ((tempGameStateList[day-1] == 'lost') ? ('✘') : '')
  } else {
    var count = Number(tempGameStateList[500])
    var header_symbol = ""
    for (var i = 0; i < count; i++) {
      if (Math.abs(tempGameStateList[501+i]) == wordIndex) {
        if (Number(tempGameStateList[501+i]) > 0) {
          header_symbol = '✔'
        } else {
          header_symbol = '✘'
        }
        break
      }
    }
  }

  var items_list = []
  for (var j = 0; j < Number(tempGameStateList[500]); j++) {
    items_list.push(501 + j);
  }
  for (var i = 1; i <= og_day; i++) {
    items_list.push(i)
  }
  var elements = items_list.map(i => {
    return (
      <Menu.Item key={i}>
        {({ active }) =>
          (
            <a onMouseDown={() => playDay(i)} className=
              {
                classNames(active ? 'font-bold text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm '+tempGameStateList[i-1])
              }>{(i < 500 ? 'Day '+i : 'Challenge '+Math.abs(tempGameStateList[i]).toString())
                +(i < 500? (tempGameStateList[i-1] == state.won) ? ' ✔' : ((tempGameStateList[i-1] == state.lost) ? ' ✘' : ''):
                           (tempGameStateList[i] > 0 ? ' ✔' : ' ✘'))
              }
            </a>
          )
        }
      </Menu.Item>
    );
  });

  var game_id = () => {
    return wordIndex.toString()+(day>0?' (Day '+day.toString()+')':'')
  }
  if (darkMode == true) {
    var html = document.getElementsByTagName( 'html' )[0]; // '0' to assign the first (and only `HTML` tag)
    html.setAttribute( 'class', 'dark-bg' );
  }
  else {
    var html = document.getElementsByTagName( 'html' )[0]; // '0' to assign the first (and only `HTML` tag)
    html.setAttribute( 'class', 'bg' );
  }

  if (window.innerWidth < 600) {
    return (
      <div className={darkMode ? 'dark h-fill' : 'h-fill'}>
        <div className={`flex flex-col justify-between h-fill bg-background dark:bg-background-dark`}>
          <header className="flex items-center py-2 px-3 text-primary dark:text-primary-dark">
            <button type="button" onClick={() => setSettingsModalIsOpen(true)}>
              <Settings />
            </button>
            <h1 className={"flex-1 text-center text-l xxs:text-lg sm:text-3xl tracking-wide font-bold font-og"}>
              WORDLE CHALLENGE! {game_id()} {header_symbol}
            </h1>
            <button className="mr-2" type="button" onClick={() => setIsOpen(true)}>
              <Share />
            </button>
            <button type="button" onClick={() => setInfoModalIsOpen(true)}>
              <Info />
            </button>
          </header>
           <div className="flex flex-force-center items-center py-3">
            <div className="flex items-center px-2">
              <button
                type="button"
                className="rounded px-2 py-2 w-24 text-sm nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark"
                onClick={playChallengeHandle}>Play Challenge
              </button>
            </div>
            <div className="flex items-center px-2">
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="blurthis rounded px-2 py-2 w-24 text-sm nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark">
                    Play Previous
                  </Menu.Button>
                </div>
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-42 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none overflow-y-scroll h-56">
                    <div className="py-1">
                      {elements}
                    </div>
                  </Menu.Items>
              </Menu>
            </div>
            <div className="flex items-center px-2">
              <button
                type="button"
                className="rounded px-2 py-2 w-24 text-sm nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark"
                onClick={createNew}>Create Challenge
              </button>
            </div>
          </div>
          <div className="flex items-center flex-col py-4">
            <div className="grid grid-cols-5 grid-flow-row gap-4">
              {board.map((row, rowNumber) =>
                row.map((letter, colNumber) => (
                  <span
                    key={colNumber}
                    className={`${getCellStyles(
                      rowNumber,
                      colNumber,
                      letter
                    )} inline-flex items-center font-medium justify-center text-xl w-[14vw] h-[14vw] xs:w-14 xs:h-14 sm:w-20 sm:h-20 rounded`}
                  >
                    {letter}
                  </span>
                ))
              )}
            </div>
          </div>
          <InfoModal
            isOpen={infoModalIsOpen}
            handleClose={handleInfoClose}
            darkMode={darkMode}
            colorBlindMode={colorBlindMode}
            styles={modalStyles}
          />
          <EndGameModal
            isOpen={modalIsOpen}
            handleClose={closeModal}
            styles={modalStyles}
            darkMode={darkMode}
            gameState={gameState}
            state={state}
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            answer={answer}
            playAgain={() => {
              closeModal()
              streakUpdated.current = false
            }}
            day={game_id} 
            currentRow={currentRow}
            cellStatuses={cellStatuses}
          />
          <SettingsModal
            isOpen={settingsModalIsOpen}
            handleClose={() => setSettingsModalIsOpen(false)}
            styles={modalStyles}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            colorBlindMode={colorBlindMode}
            toggleColorBlindMode={toggleColorBlindMode}
            challengeDifficulty={challengeDifficulty}
            setChallengeDifficulty={setChallengeDifficulty}
            challengePlayInStrict={challengePlayInStrict}
            toggleChallengePlayInStrict={toggleChallengePlayInStrict}
          />          
          <ChallengeInputModal
            isOpen={challengeInputModalIsOpen}
            handleClose={challengeInputModalCloseHandle}
            styles={modalStyles}
            darkMode={darkMode}
            onSubmit={onChallengeInputSubmit}
            colorBlindMode={colorBlindMode}
            toggleColorBlindMode={toggleColorBlindMode}
          />
          <Keyboard
            letterStatuses={letterStatuses}
            addLetter={addLetter}
            onEnterPress={onEnterPress}
            onDeletePress={onDeletePress}
            gameDisabled={gameState !== state.playing && gameState !== state.creating}
            colorBlindMode={colorBlindMode}
          />
        </div>
      </div>
    )
  }
  else {
    return (
      <div className={darkMode ? 'dark h-fill' : 'h-fill'}>
        <div className={`flex flex-col justify-between h-fill bg-background dark:bg-background-dark`}>
          <header className="flex items-center py-2 px-3 text-primary dark:text-primary-dark">
            <button type="button" onClick={() => setSettingsModalIsOpen(true)}>
              <Settings />
            </button>
            <h1 className={"flex-1 text-center text-xl xxs:text-2xl -mr-6 sm:text-4xl tracking-wide font-bold font-og"}>
              Wordle Challenge! {game_id()} {header_symbol}
            </h1>
            <button className="mr-6" type="button" onClick={() => setIsOpen(true)}>
              <Share />
            </button>
            <button type="button" onClick={() => setInfoModalIsOpen(true)}>
              <Info />
            </button>
          </header>
          <div className="flex flex-force-center items-center py-3">
            <div className="flex items-center px-3">
              <button
                type="button"
                className="rounded px-3 py-2 mt-1 w-42 text-lg nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark"
                //onClick={playFirst}>First
                onClick={playChallengeHandle}>Play Challenge
              </button>
            </div>
            <div className="flex items-center px-3">
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="blurthis rounded px-3 py-2 mt-1 w-42 text-lg nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark">
                    Play Previous
                  </Menu.Button>
                </div>
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none overflow-y-scroll h-56">
                    <div className="py-1">
                      <Menu.Item key={i}>
                        {({ active }) =>
                          (
                            <a onMouseDown={() => playRandom()} className=
                              {
                                classNames(active ? 'font-bold text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm')
                              }>Random
                            </a>
                          )
                        }
                      </Menu.Item>
                      {elements}
                    </div>
                  </Menu.Items>
              </Menu>
            </div>
            <div className="flex items-center px-3">
              <button
                type="button"
                className="rounded px-3 py-2 mt-1 w-42 text-lg nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark"
                onClick={createNew}>
                Create Challenge
              </button>
            </div>
          </div>
          <div className="flex items-center flex-col py-4">
            <div className="grid grid-cols-5 grid-flow-row gap-4">
              {board.map((row, rowNumber) =>
                row.map((letter, colNumber) => (
                  <span
                    key={colNumber}
                    className={`${getCellStyles(
                      rowNumber,
                      colNumber,
                      letter
                    )} inline-flex items-center font-bold justify-center text-3xl w-[14vw] h-[14vw] xs:w-14 xs:h-14 sm:w-20 sm:h-20 rounded`}
                  >
                    {letter}
                  </span>
                ))
              )}
            </div>
          </div>
          <InfoModal
            isOpen={infoModalIsOpen}
            handleClose={handleInfoClose}
            darkMode={darkMode}
            colorBlindMode={colorBlindMode}
            styles={modalStyles}
          />
          <EndGameModal
            isOpen={modalIsOpen}
            handleClose={closeModal}
            styles={modalStyles}
            darkMode={darkMode}
            gameState={gameState}
            state={state}
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            answer={answer}
            playAgain={() => {
              closeModal()
              streakUpdated.current = false
            }}
            day={game_id}
            currentRow={currentRow}
            cellStatuses={cellStatuses}
          />
          <SettingsModal
            isOpen={settingsModalIsOpen}
            handleClose={() => setSettingsModalIsOpen(false)}
            styles={modalStyles}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            colorBlindMode={colorBlindMode}
            toggleColorBlindMode={toggleColorBlindMode}
            challengeDifficulty={challengeDifficulty}
            setChallengeDifficulty={setChallengeDifficulty}
            challengePlayInStrict={challengePlayInStrict}
            toggleChallengePlayInStrict={toggleChallengePlayInStrict}

          />
          <ChallengeInputModal
            isOpen={challengeInputModalIsOpen}
            handleClose={challengeInputModalCloseHandle}
            styles={modalStyles}
            darkMode={darkMode}
            onSubmit={onChallengeInputSubmit}
            colorBlindMode={colorBlindMode}
            toggleColorBlindMode={toggleColorBlindMode}
          />
          <Keyboard
            letterStatuses={letterStatuses}
            addLetter={addLetter}
            onEnterPress={onEnterPress}
            onDeletePress={onDeletePress}
            gameDisabled={gameState !== state.playing && gameState !== state.creating}
            colorBlindMode={colorBlindMode}
          />
        </div>
      </div>
    )
  }
}

export default App
