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
import { Menu } from '@headlessui/react'
import { AlertModal } from './components/AlertModal'
import Fail from './data/Cross.png'

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

var isGameReviewOn = false
var gameBoardUrl = null

// Set the day number of the puzzle to display and show it as the address bar query string
const setDay = newDay => {
  if (wordIndex < 0) {
    if (newDay < 1 || newDay > og_day) {
      newDay = og_day; 
    }
    day = newDay;
    var word = getDayAnswer(day);
    wordIndex = new_words.indexOf(word.toLowerCase());
  }
  if (isGameReviewOn) return
  window.history.pushState({}, '', '?wi=' + wordIndex);
};


const getDay = (og_day) => {
  const { search } = document.location;
  var url_day = og_day
  if (search) {
    const urlParams = new URLSearchParams(search);
    gameBoardUrl = urlParams.get('ib')
    if (gameBoardUrl && gameBoardUrl !== "") {
      isGameReviewOn = true
      return og_day
    }
    var i = urlParams.get('wi');
    if ((i && i > 0) || i < new_words.length ) {
      wordIndex = Number(i);
      if (getDayAnswer(og_day).toLowerCase() === new_words[wordIndex]){
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

const getOGDay = () => {
  const today = new Date()
  const date1 = new Date('6/21/21')
  const diffTime = Math.abs(today - date1)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

const getCurrentChallengeState = (gameStateList) => {
  for (let i = 0; i < Number(gameStateList[500]); i++) {
    const challengeState = gameStateList[501+i]
    if (challengeState.wordIndex === wordIndex) return challengeState
  }
}
const getIsSavedSolution = () => {
  const gameStateList = JSON.parse(localStorage.getItem('gameStateList'))

  if (gameStateList) {
    if (day >0) {
      const dayState = gameStateList[day-1]
      return dayState && dayState.state === state.won && dayState.board !== null
    } else {
      const challengeState = getCurrentChallengeState(gameStateList)
      return challengeState && challengeState.state === state.won && challengeState.board != null
    }
  }

  return false;
}

const getIsClearedSolution = (idx) => {
  const gameStateList = JSON.parse(localStorage.getItem('gameStateList'))

  if (gameStateList) {
    const dayState = gameStateList[idx-1]
    return dayState?.state === state.won && dayState?.board === null
  }

  return false;
}

const calculateBoardScore = (b) => {

  const numGuesses = b?b
      .flatMap(row => row.join('') ? 1 : 0)
      .reduce((acc, curr) => acc + curr, 0)
      : null

  return numGuesses ? `${numGuesses}/6` : '';
}

const conf_matrix = [
  'DHeJFcBaig',
  'TqkRLsmoNP',
  'bYWvxUzAdC',
  'flMEnKhGIj',
  'qRXswPouTV',
  'dzAbhGCfEI'
]

const atoi = (row, str) => {
  var num_str = [], x;
  for (let i = 0; i < 5; i++) {
    x = conf_matrix[row].indexOf(str[i])
    if (x < 0) return -1
    num_str.push('0123456789'[x])
  }
  return Number(num_str.join(''))
}

const calculateBoardUrl = (board) => {
  const max = new_words.length - 1;
  var b2 = [
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
  ]
  var numbers = [Array(6)]
  var answerIdx = -1
  var num_str, word
  if (!board || board[0][0] === '') return ""

  board.forEach((row, idx) => {
    word = row.join('')
    if (!word) { 
      if (answerIdx < 0) answerIdx = Number(num_str)
      numbers[row] = answerIdx
      word = new_words[answerIdx]
    }
    numbers[row] = new_words.indexOf(word.toLowerCase())
    num_str = numbers[row].toString().padStart(5, '0')
    for (let i =0; i <5; i++ ) {
      b2[idx][i] = conf_matrix[idx][Number(num_str[i])]
    }
  })
  var url = window.location.origin+window.location.pathname+"?ib="+answerIdx.toString()+':'
  b2.forEach((row, idx) => {
    url = url+row.join('')
  })
  var tot = numbers.reduce((tot, v) => tot + v).toString()
  return answerIdx < 0? '': url
}

const getBoardFromUrl = (urlString) => {
  var board = [
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['', '', '', '', ''],
  ]

  var url, answerIndex

  try {
    answerIndex = Number(urlString.split(':')[0])
    url = urlString.split(':')[1]
  } catch {
    return [false, board, -1]
  }

  var answerFound = false
  if (url.length != 30) return [false, board, -1]
  for (let i = 0; i < 6; i++ ){
    var row_str = url.slice(i*5, (i*5)+5)
    var idx = atoi(i, row_str)
    if (idx < 0 || idx >= new_words.length) return [false, board, -1]
    if (answerFound && idx != answerIndex) return [false, board, -1]
    var word = new_words[idx].toUpperCase()
    for (let j=0; j < 5; j++) board[i][j] = answerFound? '': word[j]
    if (idx == answerIndex) {
      answerFound = true
    }
  }
  return [answerFound, board, answerIndex]
}

const calculateScore = (idx_) => {
  const gameStateList = JSON.parse(localStorage.getItem('gameStateList'))

  if (gameStateList) {
    const dayState = gameStateList[idx_-1];
    const board = dayState?.board;

    // puzzle was solved before we tracked board state in
    // local storage. we'll still show the solved puzzle
    // (on first row) but don't show score since its unknown
    if (dayState?.scoreUnknown) {
      return '';
    }
    //const url = calculateBoardUrl(board) // testing
    //const b2 = getBoardFromUrl(url.split('/)[3]) // testing
    return calculateBoardScore(board)
  }

  return '';
}

// check if gameStateList is old gameStateList shape (array of strings) and
// update to new shape (array of objects w/ state and board). if a user has
// solved a puzzle before this feature was implemented we will show the answer
// on the first row since we don't know how many guesses they took to win
const oneTimeGameStateListUpdate = (stringGameStateList) => {
    var count = 0;
  const objectGameStateList = stringGameStateList.map((gameState, idx) => {
      if ( idx < 500 ) {
        if (gameState === state.won) {
          return {
            state: state.won,
            scoreUnknown: true,
            board: new Array(6)
              .fill(wordle_answers[idx].toUpperCase().split(''), 0, 1)
              .fill(new Array(5).fill(''), 1),
            wordIndex: new_words.indexOf(wordle_answers[idx])
          }
        }
        return {
          state: gameState,
          board: null,
          wordIndex: new_words.indexOf(wordle_answers[idx])
        }
      } else if ( idx === 500 ){
        count = Number (gameState)
      } else {
        if ( idx > 500 + count ) return
        if (typeof(gameState) === 'string') {
          var oldIndex = gameState
          return {
            state: oldIndex > 0? state.won : state.lost,
            scoreUnknown: oldIndex > 0? true : null,
            wordIndex: Math.abs(oldIndex),
            board: oldIndex < 0? null : new Array(6)
              .fill(new_words[Math.abs(oldIndex)].toUpperCase().split(''), 0, 1)
              .fill(new Array(5).fill(''), 1)
          }
        }
      }
    }
  );
  if (count > 0) {
    objectGameStateList[500] = count.toString();
  }
  localStorage.setItem('gameStateList', JSON.stringify(objectGameStateList));
}

const wordle_answers = ["rebut", "sissy", "humph", "awake", "blush", "focal", "evade", "naval", "serve", "heath", "dwarf", "model", "karma", "stink", "grade", "quiet", "bench", "abate", "feign", "major", "death", "fresh", "crust", "stool", "colon", "abase", "marry", "react", "batty", "pride", "floss", "helix", "croak", "staff", "paper", "unfed", "whelp", "trawl", "outdo", "adobe", "crazy", "sower", "repay", "digit", "crate", "cluck", "spike", "mimic", "pound", "maxim", "linen", "unmet", "flesh", "booby", "forth", "first", "stand", "belly", "ivory", "seedy", "print", "yearn", "drain", "bribe", "stout", "panel", "crass", "flume", "offal", "agree", "error", "swirl", "argue", "bleed", "delta", "flick", "totem", "wooer", "front", "shrub", "parry", "biome", "lapel", "start", "greet", "goner", "golem", "lusty", "loopy", "round", "audit", "lying", "gamma", "labor", "islet", "civic", "forge", "corny", "moult", "basic", "salad", "agate", "spicy", "spray", "essay", "fjord", "spend", "kebab", "guild", "aback", "motor", "alone", "hatch", "hyper", "thumb", "dowry", "ought", "belch", "dutch", "pilot", "tweed", "comet", "jaunt", "enema", "steed", "abyss", "growl", "fling", "dozen", "boozy", "erode", "world", "gouge", "click", "briar", "great", "altar", "pulpy", "blurt", "coast", "duchy", "groin", "fixer", "group", "rogue", "badly", "smart", "pithy", "gaudy", "chill", "heron", "vodka", "finer", "surer", "radio", "rouge", "perch", "retch", "wrote", "clock", "tilde", "store", "prove", "bring", "solve", "cheat", "grime", "exult", "usher", "epoch", "triad", "break", "rhino", "viral", "conic", "masse", "sonic", "vital", "trace", "using", "peach", "champ", "baton", "brake", "pluck", "craze", "gripe", "weary", "picky", "acute", "ferry", "aside", "tapir", "troll", "unify", "rebus", "boost", "truss", "siege", "tiger", "banal", "slump", "crank", "gorge", "query", "drink", "favor", "abbey", "tangy", "panic", "solar", "shire", "proxy", "point", "robot", "prick", "wince", "crimp", "knoll", "sugar", "whack", "mount", "perky", "could", "wrung", "light", "those", "moist", "shard", "pleat", "aloft", "skill", "elder", "frame", "humor", "pause", "ulcer", "ultra", "robin", "cynic", "aroma", "caulk", "shake", "dodge", "swill", "tacit", "other", "thorn", "trove", "bloke", "vivid", "spill", "chant", "choke", "rupee", "nasty", "mourn", "ahead", "brine", "cloth", "hoard", "sweet", "month", "lapse", "watch", "today", "focus", "smelt", "tease", "cater", "movie", "saute", "allow", "renew", "their", "slosh", "purge", "chest", "depot", "epoxy", "nymph", "found", "shall", "harry", "stove", "lowly", "snout", "trope", "fewer", "shawl", "natal", "comma", "foray", "scare", "stair", "black", "squad", "royal", "chunk", "mince", "shame", "cheek", "ample", "flair", "foyer", "cargo", "oxide", "plant", "olive", "inert", "askew", "heist", "shown", "zesty", "hasty", "trash", "fella", "larva", "forgo", "story", "hairy", "train", "homer", "badge", "midst", "canny", "fetus", "butch", "farce", "slung", "tipsy", "metal", "yield", "delve", "being", "scour", "glass", "gamer", "scrap", "money", "hinge", "album", "vouch", "asset", "tiara", "crept", "bayou", "atoll", "manor", "creak", "showy", "phase", "froth", "depth", "gloom", "flood", "trait", "girth", "piety", "payer", "goose", "float", "donor", "atone", "primo", "apron", "blown", "cacao", "loser", "input", "gloat", "awful", "brink", "smite", "beady", "rusty", "retro", "droll", "gawky", "hutch", "pinto", "gaily", "egret", "lilac", "sever", "field", "fluff", "hydro", "flack", "agape", "voice", "stead", "stalk", "berth", "madam", "night", "bland", "liver", "wedge", "augur", "roomy", "wacky", "flock", "angry", "bobby", "trite", "aphid", "tryst", "midge", "power", "elope", "cinch", "motto", "stomp", "upset", "bluff", "cramp", "quart", "coyly", "youth", "rhyme", "buggy", "alien", "smear", "unfit", "patty", "cling", "glean", "label", "hunky", "khaki", "poker", "gruel", "twice", "twang", "shrug", "treat", "unlit", "waste", "merit", "woven", "octal", "needy", "clown", "widow", "irony", "ruder", "gauze", "chief", "onset", "prize", "fungi", "charm", "gully", "inter", "whoop", "taunt", "leery", "class", "theme", "lofty", "tibia", "booze", "alpha", "thyme", "eclat", "doubt", "parer", "chute", "stick", "trice", "alike", "sooth", "recap", "saint", "liege", "glory", "grate", "admit", "brisk", "soggy", "usurp", "scald", "scorn", "leave", "twine", "sting", "bough", "marsh", "sloth", "dandy", "vigor", "howdy", "enjoy"]
var day = -1;
var wordIndex = -1;
const og_day = getOGDay()
setDay(getDay(og_day));
var game_board, gameIdx, gameUrlValid

if (isGameReviewOn) {
  [gameUrlValid, game_board, gameIdx] = getBoardFromUrl(gameBoardUrl)
  //if (!gameUrlValid) isGameReviewOn = false;
}


function App() {

  const reloadCount = Number(sessionStorage.getItem('reloadCount')) || 0;

  const initialStates = {
    answer: () => {
      if (isGameReviewOn && gameUrlValid) {
        return new_words[gameIdx].toUpperCase()
      }
      return getDayAnswerWithIndex(wordIndex)
    },
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
  const [board, setBoard] = useState(
      initialStates.board
    )
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
  const [alertModalIsOpen, setAlertModalIsOpen] = useState(false)
  const [alertMessage, setAlertMessage] = useState("<no message>")

  const [gameStateList, setGameStateList] = useLocalStorage(
    'gameStateList',
    Array(800).fill({ state: 'none', board: null, wordIndex: -1})
  )
  
  if (typeof gameStateList[500] === 'object'){
    gameStateList[500] = '0'
    for (var i = 501; i < 800; i++) {
      gameStateList[i] = { state: 'none', board: null, wordIndex: -1 }
    }
  }
  const [isSavedSolution, setIsSavedSolution] = useState(getIsSavedSolution())

  const openModal = () => {
    if (gameState !== state.creating) {
      setIsOpen(true)
    }
  }
  const closeModal = () => {
    setIsOpen(false)
    if (gameState === state.created) {
      setInitialGameState()
    }
  }

  const showAlert = (message) => {
    setAlertMessage(message)
    setAlertModalIsOpen(true)
  }

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
    if (gameState === state.won || gameState === state.lost || gameState === state.created) {
      if (!isSavedSolution) {
        setTimeout(() => {
          openModal()
        }, 500)
      }
    }
  }, [gameState, isSavedSolution])

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
    const jsonGameStateList = localStorage.getItem('gameStateList');
    if (jsonGameStateList == null) {
      setGameStateList(gameStateList)
    } else {
      const gameStateList = JSON.parse(jsonGameStateList);

      // address regression impact of gameStateList change
      // see oneTimeGameStateListUpdate for more info on this
      if (typeof gameStateList[0] === 'string' || typeof gameStateList[501] === 'string') {
        oneTimeGameStateListUpdate(gameStateList);
      }
    }

    // set to a blank board or the board from a past win
    setInitialGameState();
  }, [])

  useEffect(() => {
    if (reloadCount < 1 && !isGameReviewOn) {
      window.location.reload(true);
      sessionStorage.setItem('reloadCount', String(reloadCount + 1));
    } else {
      sessionStorage.removeItem('reloadCount');
    }
  }, [og_day])

  // update letter and cell statuses each time we move onto a
  // new row and when we switch to a puzzle with a saved solution
  useEffect(() => {
    const isGameOver = currentRow === 6;
    const isEnterPressOrSavedGame = currentRow !== 6 && currentCol === 0 && (
      board[currentRow][currentCol] === '' || isSavedSolution
    );

    if (isGameOver || isEnterPressOrSavedGame) {
      board.forEach((row, idx) => {
        const word = row.join('')

        if (word) {
          updateLetterStatuses(word)
          updateCellStatuses(word, idx)
        }
      })
    }
  //}, [currentCol, currentRow, board])
  }, [isSavedSolution, board])

  const setInitialGameState = () => {
    const gameStateList = JSON.parse(localStorage.getItem('gameStateList'))

    setAnswer(initialStates.answer)
    setCurrentRow(initialStates.currentRow)
    setCurrentCol(initialStates.currentCol)
    setExactGuesses({})
    setCellStatuses(initialStates.cellStatuses)
    setLetterStatuses(initialStates.letterStatuses)

    if (isGameReviewOn && gameUrlValid) {
      setIsSavedSolution(true)
      setBoard(game_board)
      return
    } else if  (gameStateList && getIsSavedSolution()) {
      setIsSavedSolution(true)
      setGameState(state.won)
      if (day > 0) {
        setBoard(gameStateList[day-1].board)
      }
      else {
        const challengeState = getCurrentChallengeState(gameStateList)
        setBoard(challengeState.board)
      } 
    } else {
      setIsSavedSolution(false)
      setBoard(initialStates.board)
      setGameState(initialStates.gameState)
    }
  }

  const clearSolution = () => {
    const newGameStateList = JSON.parse(localStorage.getItem('gameStateList'))
    if ( day > 0 ) {
      newGameStateList[day-1].board = null;
    } else {
      const challengeState = getCurrentChallengeState(newGameStateList)
      challengeState.board = null;
    }
    localStorage.setItem("gameStateList", JSON.stringify(newGameStateList))
    setInitialGameState();
  }

  const getCellStyles = (rowNumber, colNumber, letter) => {
    if (rowNumber === currentRow && !isSavedSolution) {
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
  const createNewChallenge = () => {
    setCellStatuses(initialStates.cellStatuses)
    setLetterStatuses(initialStates.letterStatuses)
    setGameState(state.creating)
    localStorage.setItem('challengeWord', '')
    localStorage.setItem('challengeIndex', '')
    setCurrentRow(initialStates.currentRow)
    setCurrentCol(initialStates.currentCol)
    setSubmittedInvalidWord(false)
    setIsSavedSolution(false)
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
    //challengeInputModalCloseHandle();
    // do things here for playing challenge chosen
    //playIndex(val)
    window.open(val,"_self")
  };
 

  const isValidWord = (word) => {
    if (word.length < 5) return [false, 'Please enter a 5 letter word']
    var validWord = new_words.indexOf(word.toLowerCase()) >= 0
    if (!validWord) return [false, word+ ' is not a valid word!']
    if (gameState == state.creating) {
      if (challengeDifficulty == challengeDifficultyLevel.hard) return [true, ''];
      else return [wordle_answers.indexOf(word.toLowerCase()) >= 0, word+' is not in the wordle answers!']
    }
    if (!challengePlayInStrict) return [true, ''];
    const guessedLetters = Object.entries(letterStatuses).filter(([letter, letterStatus]) =>
      [status.yellow, status.green].includes(letterStatus)
    )
    const yellowsUsed = guessedLetters.every(([letter, _]) => word.includes(letter))
    const greensUsed = Object.entries(exactGuesses).every(
      ([position, letter]) => word[parseInt(position)] === letter
    )
    if (!yellowsUsed || !greensUsed) return [false, 'In strict mode play, you must use all the hints given']
    return [true, '']
  }

  const onEnterPress = () => {
    const word = board[currentRow].join('')

    const [valid, msg] = isValidWord(word)
    if (!valid) {
      showAlert(msg)
      setSubmittedInvalidWord(true)
      return
    }

    if (gameState == state.creating) {
      //setCellStatuses(Array(1).fill(Array(5).fill(status.green)))
      localStorage.setItem('challengeWord', word)
      localStorage.setItem('challengeIndex', new_words.indexOf(word.toLowerCase()).toString())
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

    const updateChallengeStatus = (arr, game_state) => {
      const count = Number(arr[500]);
      var challengeState;

      for (var i=0; i < count; i++) {
        challengeState = arr[501+i];
        if (challengeState.wordIndex == wordIndex) {
          challengeState.state = game_state
          challengeState.board = board
          challengeState.scoreUnknown = false
          return;
        }
      }
      challengeState = arr[501+count]
      challengeState.wordIndex = wordIndex
      challengeState.state = game_state
      challengeState.board = board
      challengeState.scoreUnknown = false
      arr[500] = (count+1).toString();
    }

    // don't update game state for already won games
    if (!isSavedSolution) {
      const newGameStateList = JSON.parse(localStorage.getItem('gameStateList'))
      const dayState = newGameStateList[day-1]

      if (lastFilledRow && isRowAllGreen(lastFilledRow)) {
        if (day < 0) {
          setGameState(state.won)
          updateChallengeStatus(newGameStateList, state.won);
        } else {
          setGameState(state.won)
          dayState.board = board
          dayState.state = state.won
          dayState.scoreUnknown = false
          dayState.wordIndex = wordIndex
        }
      } else if (currentRow === 6) {
        if (day < 0) {
          dayState.state = state.lost
          updateChallengeStatus(newGameStateList, state.lost);
        } else {
          setGameState(state.lost)
          dayState.state = state.lost
          dayState.wordIndex = wordIndex
        }
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

  const alertModalStyles = {
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
      //height: 'calc(100% - 2rem)',
      //width: 'calc(100% - 2rem)',
      backgroundColor: darkMode ? 'hsl(231, 16%, 25%)' : 'hsl(231, 16%, 92%)',
      boxShadow: `${darkMode
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

  const play = () => { // TODO: remove if not used
    setAnswer(initialStates.answer)
    setGameState(initialStates.gameState)
    setBoard(initialStates.board)
    setCellStatuses(initialStates.cellStatuses)
    setCurrentRow(initialStates.currentRow)
    setCurrentCol(initialStates.currentCol)
    setLetterStatuses(initialStates.letterStatuses)
    setExactGuesses({})
  }

  const playRandom = () => playDay(Math.floor(Math.random() * (og_day-1)) + 1)

  const playDay = (i) => {
    if (day == i) return
    day = i;
    var word = getDayAnswer(i);
    wordIndex = new_words.indexOf(word.toLowerCase());
    setDay(i)
    setInitialGameState()
  }

  const playIndex = (i) => {
    if ( wordIndex == i && day < 0) return
    if (i >= 0 || i < new_words.length) {
      wordIndex = Number(i);
      day = -1;
      setDay(i)
      //play()
      setInitialGameState()
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
      if (tempGameStateList[i-1].state == state.won) {
        textNumber.classList.add('green-text');
      }
      if (tempGameStateList[i-1].state == state.lost) {
        textNumber.classList.add('red-text');
      }
    }
  }

  var header_symbol = ""
  if (gameState !== state.creating) {
    if ( day > 0) {
      header_symbol = (tempGameStateList[day - 1].state == 'won') ? ('✔') : ((tempGameStateList[day - 1].state == 'lost') ? ('✘') : '')
    } else {
      var count = Number(tempGameStateList[500])
      for (i = 0; i < count; i++) {
        if (tempGameStateList[501+i].wordIndex == wordIndex) {
          header_symbol = (tempGameStateList[501+i].state == 'won') ? ('✔') : ((tempGameStateList[501+i].state == 'lost') ? ('✘') : '')
          break
        }
      }
    }
  }
  var items_list = []
  for (var j = 0; j < Number(tempGameStateList[500]); j++) {
    items_list.push(501 + j);
  }
  for (i = 1; i <= og_day; i++) {
    items_list.push(i)
  }
  var elements = items_list.map(i => {
    return (
      <Menu.Item key={i}>
        {({ active }) =>
          (
          <button onClick={() => i < 500 ? playDay(i) : playIndex(tempGameStateList[i].wordIndex)} className={classNames(
              tempGameStateList[i<500?i-1:i].state,
              getIsClearedSolution(i<500?i:i+1) ? "cleared" : "",
              active ? 'font-bold text-gray-900' : 'text-gray-700',
              'flex justify-between px-4 py-2 text-sm w-full',
            )}>
                <span>
                  {(i < 500 ? 'Day '+i : '#'+tempGameStateList[i].wordIndex)
                  +(tempGameStateList[i<500?i-1:i].state == state.won ? ' ✔' : tempGameStateList[i<500?i-1:i].state == state.lost ? ' ✘' : '')}
                </span>
                <span>
                  {calculateScore(i<500?i:i+1)}
                </span>
            </button>
          )
        }
      </Menu.Item>
    );
  });

  var game_id = () => {
    if (gameState == state.creating) return ""
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
    if (isGameReviewOn) {
      if (gameUrlValid) {
      return (
        <div className={darkMode ? 'dark h-fill' : 'h-fill'}>
          <div className={`flex flex-col justify-between h-fill bg-background dark:bg-background-dark`}>
            <header className="flex items-center py-2 px-3 text-primary dark:text-primary-dark">
              <h1 className={"flex-1 text-center text-l xxs:text-lg sm:text-3xl tracking-wide font-bold font-og"}>
                Wordle Challenge Game Review {gameIdx}
              </h1>
            </header>
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
                    {' '}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      )
      } else {
        return (
        <div className={darkMode ? 'dark h-fill' : 'h-fill'}>
          <div className={`flex flex-col justify-between h-fill bg-background dark:bg-background-dark`}>
            <header className="flex items-center py-2 px-3 text-primary dark:text-primary-dark">
              <h1 className={"flex-1 text-center text-l xxs:text-lg sm:text-3xl tracking-wide font-bold font-og"}>
                Oops! Invalid URL!! 
              </h1>
            </header>
              <div className="flex items-center px-3 flex-col justify-center">
                <img src={Fail} alt="success" height="auto" width="40%" />
              </div>
          </div>
        </div>
        )
      }
    } else 
    return (
      <div className={darkMode ? 'dark h-fill' : 'h-fill'}>
        <div className={`flex flex-col justify-between h-fill bg-background dark:bg-background-dark`}>
          <header className="flex items-center py-2 px-3 text-primary dark:text-primary-dark">
            <button type="button" onClick={() => setSettingsModalIsOpen(true)}>
              <Settings />
            </button>
            <h1 className={"flex-1 text-center py-2 text-l xxs:text-lg sm:text-3xl tracking-wide font-bold font-og"}>
              WORDLE CHALLENGE! {game_id()} {header_symbol}
            </h1>
            <button className="mr-2" type="button" onClick={openModal}>
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
                onClick={createNewChallenge}>Create Challenge
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
                    { isSavedSolution? ' ': letter}
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
          <AlertModal
            isOpen={alertModalIsOpen}
            handleClose={() => setAlertModalIsOpen(false)}
            darkMode={darkMode}
            colorBlindMode={colorBlindMode}
            styles={alertModalStyles}
            message={alertMessage}
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
            currentScore={calculateBoardScore(board)}
            cellStatuses={cellStatuses}
            gameUrl={()=>calculateBoardUrl(board)}
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
            isSolved={gameState === state.won}
            onClear={clearSolution}
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
    if (isGameReviewOn) {
      if (gameUrlValid) {
        return (
          <div className={darkMode ? 'dark h-fill' : 'h-fill'}>
            <div className={`flex flex-col justify-between h-fill bg-background dark:bg-background-dark`}>
              <header className="flex items-center py-2 px-3 text-primary dark:text-primary-dark">
                <h1 className={"flex-1 text-center py-2 text-xl xxs:text-2xl -mr-6 sm:text-3xl tracking-wide font-bold font-og"}>
                  Wordle Challenge Game Review {gameIdx}
                </h1>
              </header>
            </div>
            <div className="flex items-center flex-col py-2">
              <div className="grid grid-cols-5 grid-flow-row gap-2">
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
                      {' '}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        )
      } else {
        return (
        <div className={darkMode ? 'dark h-fill' : 'h-fill'}>
          <div className={`flex flex-col justify-between h-fill bg-background dark:bg-background-dark`}>
            <header className="flex items-center py-2 px-3 text-primary dark:text-primary-dark">
              <h1 className={"flex-1 text-center py-2 text-xl xxs:text-2xl -mr-6 sm:text-3xl tracking-wide font-bold font-og"}>
                Oops!  Invalid URL!!
              </h1>
            </header>
          </div>
            <div className="flex items-center px-3 flex-col justify-center">
              <img src={Fail} alt="success" height="auto" width="40%" />
            </div>
        </div>
        )
      }
    } else 
    return (
      <div className={darkMode ? 'dark h-fill' : 'h-fill'}>
        <div className={`flex flex-col justify-between h-fill bg-background dark:bg-background-dark`}>
          <header className="flex items-center px-3 text-primary dark:text-primary-dark">
            <button type="button" onClick={() => setSettingsModalIsOpen(true)}>
              <Settings />
            </button>
            <h1 className={"flex-1 text-center text-xl xxs:text-2xl -mr-6 sm:text-3xl tracking-wide font-bold font-og"}>
              Wordle Challenge! {game_id()} {header_symbol}
            </h1>
            <button className="mr-6" type="button" onClick={openModal}>
              <Share />
            </button>
            <button type="button" onClick={() => setInfoModalIsOpen(true)}>
              <Info />
            </button>
          </header>
          <div className="flex flex-force-center items-center py-1">
            <div className="flex items-center px-1">
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
                            <button onClick={() => playRandom()} className={classNames(active ? 'font-bold text-gray-900' : 'text-gray-700', 'block px-4 py-2 text-sm w-full text-left')}>
                              Random
                            </button>
                          )
                        }
                      </Menu.Item>
                      {elements}
                    </div>
                  </Menu.Items>
              </Menu>
            </div>
            <div className="flex items-center px-1">
              <button
                type="button"
                className="rounded px-3 py-2 mt-1 w-42 text-lg nm-flat-background dark:nm-flat-background-dark hover:nm-inset-background dark:hover:nm-inset-background-dark text-primary dark:text-primary-dark"
                onClick={createNewChallenge}>
                Create Challenge
              </button>
            </div>
          </div>
          <div className="flex items-center flex-col py-2">
            <div className="grid grid-cols-5 grid-flow-row gap-2">
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
                    { isSavedSolution? ' ': letter}
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
          <AlertModal
            isOpen={alertModalIsOpen}
            handleClose={() => setAlertModalIsOpen(false)}
            darkMode={darkMode}
            colorBlindMode={colorBlindMode}
            styles={alertModalStyles}
            message={alertMessage}
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
            currentScore={calculateBoardScore(board)}
            cellStatuses={cellStatuses}
            gameUrl={()=>calculateBoardUrl(board)}
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
            isSolved={gameState === state.won}
            onClear={clearSolution}
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
