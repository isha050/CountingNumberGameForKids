import React, { useState, useEffect, Component } from 'react';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('profilePicker');
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [currentGame, setCurrentGame] = useState(null);

  useEffect(() => {
    try {
      const savedProfiles = JSON.parse(localStorage.getItem('autismAppProfiles') || '[]');
      setProfiles(savedProfiles);
    } catch (e) {
      console.error('Failed to load profiles');
    }
  }, []);

  useEffect(() => {
    if (profiles.length > 0) {
      try {
        localStorage.setItem('autismAppProfiles', JSON.stringify(profiles));
      } catch (e) {
        console.error('Failed to save profiles');
      }
    }
  }, [profiles]);

  const createProfile = (profileData) => {
    const newProfile = {
      id: Date.now().toString(),
      ...profileData,
      gameStats: {
        counting: 0,
        tapCount: 0,
        matchNumber: 0,
        missingNumber: 0
      }
    };
    setProfiles([...profiles, newProfile]);
    setSelectedProfile(newProfile);
    setCurrentScreen('profileDashboard');
  };

  const selectProfile = (profile) => {
    setSelectedProfile(profile);
    setCurrentScreen('profileDashboard');
  };

  const updateGameStats = (gameType) => {
    if (!selectedProfile) return;
    
    const updatedProfiles = profiles.map(profile => {
      if (profile.id === selectedProfile.id) {
        return {
          ...profile,
          gameStats: {
            ...profile.gameStats,
            [gameType]: profile.gameStats[gameType] + 1
          }
        };
      }
      return profile;
    });
    
    setProfiles(updatedProfiles);
    const updatedProfile = updatedProfiles.find(p => p.id === selectedProfile.id);
    setSelectedProfile(updatedProfile);
  };

  const startGame = (gameType) => {
    setCurrentGame(gameType);
    setCurrentScreen('game');
    updateGameStats(gameType);
  };

  const backToMenu = () => {
    setCurrentGame(null);
    setCurrentScreen('gameSelect');
  };

  const backToDashboard = () => {
    setCurrentScreen('profileDashboard');
  };

  const backToProfiles = () => {
    setSelectedProfile(null);
    setCurrentScreen('profilePicker');
  };

  if (showWelcome) {
    return <WelcomeScreen onStart={() => {
      setShowWelcome(false);
      setCurrentScreen('profilePicker');
    }} />;
  }

  if (currentScreen === 'profilePicker') {
    return (
      <ProfilePicker 
        profiles={profiles}
        onSelectProfile={selectProfile}
        onCreateNew={() => setCurrentScreen('createProfile')}
      />
    );
  }

  if (currentScreen === 'createProfile') {
    return (
      <CreateProfile 
        onSave={createProfile}
        onBack={() => setCurrentScreen('profilePicker')}
      />
    );
  }

  if (currentScreen === 'profileDashboard') {
    return (
      <ProfileDashboard 
        profile={selectedProfile}
        onStartGame={() => setCurrentScreen('gameSelect')}
        onBack={backToProfiles}
      />
    );
  }

  if (currentScreen === 'gameSelect') {
    return (
      <GameSelector 
        onSelectGame={startGame}
        onBack={backToDashboard}
      />
    );
  }

  if (currentScreen === 'game') {
    return (
      <GameContainer 
        gameType={currentGame}
        onBack={backToMenu}
      />
    );
  }

  return null;
}

function ProfilePicker({ profiles, onSelectProfile, onCreateNew }) {
  return (
    <div style={styles.fullScreenContainer}>
      <h1 style={styles.pageTitle}>Choose Your Profile</h1>
      
      <div style={styles.profileCardsContainer}>
        {profiles.map(profile => (
          <button
            key={profile.id}
            onClick={() => onSelectProfile(profile)}
            style={styles.profileCard}
          >
            <div style={styles.profileAvatar}>{profile.avatar}</div>
            <div style={styles.profileCardName}>{profile.name}</div>
            <div style={styles.profileCardAge}>Age {profile.age}</div>
          </button>
        ))}
        
        <button onClick={onCreateNew} style={styles.createProfileCard}>
          <div style={styles.createProfileIcon}>+</div>
          <div style={styles.createProfileText}>New Profile</div>
        </button>
      </div>
    </div>
  );
}

function CreateProfile({ onSave, onBack }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('😊');
  
  const avatarOptions = ['😊', '🌟', '🦁', '🦋', '🌈', '🐢', '🌸', '🎈'];
  
  const handleSave = () => {
    if (!name.trim() || !age) {
      alert('Please fill in name and age');
      return;
    }
    
    onSave({
      name: name.trim(),
      age: parseInt(age),
      avatar: selectedAvatar
    });
  };
  
  return (
    <div style={styles.fullScreenContainer}>
      <button onClick={onBack} style={styles.backButton}>← Back</button>
      
      <h1 style={styles.pageTitle}>Create Profile</h1>
      
      <div style={styles.formContainer}>
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.formInput}
            placeholder="Enter name"
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            style={styles.formInput}
            placeholder="Enter age"
            min="1"
            max="20"
          />
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.formLabel}>Choose Avatar</label>
          <div style={styles.avatarGrid}>
            {avatarOptions.map(avatar => (
              <button
                key={avatar}
                onClick={() => setSelectedAvatar(avatar)}
                style={{
                  ...styles.avatarOption,
                  backgroundColor: selectedAvatar === avatar ? '#FFB7B2' : '#F0F4F8',
                  transform: selectedAvatar === avatar ? 'scale(1.1)' : 'scale(1)'
                }}
              >
                {avatar}
              </button>
            ))}
          </div>
        </div>
        
        <button onClick={handleSave} style={styles.saveButton}>
          Save Profile
        </button>
      </div>
    </div>
  );
}

function ProfileDashboard({ profile, onStartGame, onBack }) {
  const gameNames = {
    counting: 'Counting Numbers',
    tapCount: 'Tap to Count',
    matchNumber: 'Match the Number',
    missingNumber: 'Missing Number'
  };
  
  return (
    <div style={styles.fullScreenContainer}>
      <button onClick={onBack} style={styles.backButton}>← Profiles</button>
      
      <div style={styles.dashboardHeader}>
        <div style={styles.dashboardAvatar}>{profile.avatar}</div>
        <h1 style={styles.dashboardName}>{profile.name}</h1>
        <p style={styles.dashboardAge}>Age {profile.age}</p>
      </div>
      
      <div style={styles.statsContainer}>
        <h2 style={styles.statsTitle}>Games Played</h2>
        <div style={styles.statsList}>
          {Object.entries(profile.gameStats).map(([key, value]) => (
            <div key={key} style={styles.statItem}>
              <span style={styles.statName}>{gameNames[key]}</span>
              <span style={styles.statValue}>{value} plays</span>
            </div>
          ))}
        </div>
      </div>
      
      <button onClick={onStartGame} style={styles.startGameButton}>
        Start Game
      </button>
    </div>
  );
}

function GameSelector({ onSelectGame, onBack }) {
  const games = [
    { id: 'counting', name: 'Count', emoji: '🔢', color: '#FF9AA2' },
    { id: 'tapCount', name: 'Tap', emoji: '👆', color: '#FFB7B2' },
    { id: 'matchNumber', name: 'Match', emoji: '🎯', color: '#B5EAD7' },
    { id: 'missingNumber', name: 'Missing', emoji: '❓', color: '#C7CEEA' }
  ];
  
  return (
    <div style={styles.fullScreenContainer}>
      <button onClick={onBack} style={styles.backButton}>← Dashboard</button>
      
      <h1 style={styles.pageTitle}>Choose a Game</h1>
      
      <div style={styles.gameGrid}>
        {games.map(game => (
          <button
            key={game.id}
            onClick={() => onSelectGame(game.id)}
            style={{...styles.gameCard, backgroundColor: game.color}}
          >
            <div style={styles.gameEmoji}>{game.emoji}</div>
            <div style={styles.gameName}>{game.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function GameContainer({ gameType, onBack }) {
  return (
    <div style={styles.gameWrapper}>
      <button onClick={onBack} style={styles.gameBackButton}>← Menu</button>
      
      {gameType === 'counting' && <CountingMode />}
      {gameType === 'tapCount' && <TapToCountMode />}
      {gameType === 'matchNumber' && <MatchNumberGame />}
      {gameType === 'missingNumber' && <MissingNumberGame />}
    </div>
  );
}

function CountingMode() {
  const [currentNumber, setCurrentNumber] = useState(1);
  const maxNumber = 10;
  
  const objectsList = ['🍎', '🦁', '⭐', '🌸', '🐠', '🦋', '🌈', '🐢', '🌻', '🎈'];
  
  const goNext = () => {
    if (currentNumber < maxNumber) {
      setCurrentNumber(currentNumber + 1);
    }
  };
  
  const goPrevious = () => {
    if (currentNumber > 1) {
      setCurrentNumber(currentNumber - 1);
    }
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.numberDisplay}>
        {currentNumber}
      </div>
      
      <div style={styles.objectContainer}>
        <ObjectDisplay 
          count={currentNumber} 
          emoji={objectsList[currentNumber - 1]} 
        />
      </div>
      
      <div style={styles.buttonContainer}>
        <button 
          onClick={goPrevious}
          disabled={currentNumber === 1}
          style={{
            ...styles.navButton,
            opacity: currentNumber === 1 ? 0.3 : 1,
            cursor: currentNumber === 1 ? 'not-allowed' : 'pointer',
          }}
        >
          Previous
        </button>
        
        <button 
          onClick={goNext}
          disabled={currentNumber === maxNumber}
          style={{
            ...styles.navButton,
            opacity: currentNumber === maxNumber ? 0.3 : 1,
            cursor: currentNumber === maxNumber ? 'not-allowed' : 'pointer',
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function ObjectDisplay({ count, emoji }) {
  const [visibleCount, setVisibleCount] = useState(0);
  
  useEffect(() => {
    setVisibleCount(0);
    
    for (let i = 1; i <= count; i++) {
      setTimeout(() => {
        setVisibleCount(i);
      }, i * 400);
    }
  }, [count, emoji]);
  
  return (
    <div style={styles.objectGrid}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          style={{
            ...styles.object,
            opacity: index < visibleCount ? 1 : 0,
            transform: index < visibleCount ? 'scale(1)' : 'scale(0.3)',
          }}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
}

function TapToCountMode() {
  const [level, setLevel] = useState(1);
  const [tappedObjects, setTappedObjects] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const maxLevel = 10;
  const objectEmojis = ['🍎', '🦁', '⭐', '🌸', '🐠', '🦋', '🌈', '🐢', '🌻', '🎈'];
  const currentEmoji = objectEmojis[level - 1];
  
  const handleTap = (index) => {
    if (!tappedObjects.includes(index)) {
      const newTapped = [...tappedObjects, index];
      setTappedObjects(newTapped);
      
      if (newTapped.length === level) {
        setShowSuccess(true);
        
        setTimeout(() => {
          if (level < maxLevel) {
            setLevel(level + 1);
            setTappedObjects([]);
            setShowSuccess(false);
          } else {
            setTimeout(() => {
              setLevel(1);
              setTappedObjects([]);
              setShowSuccess(false);
            }, 2000);
          }
        }, 2000);
      }
    }
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.instructions}>
        Tap each object to count
      </div>
      
      <div style={styles.counter}>
        Count: {tappedObjects.length}
      </div>
      
      <div style={styles.objectGrid}>
        {Array.from({ length: level }).map((_, index) => (
          <button
            key={index}
            onClick={() => handleTap(index)}
            style={{
              ...styles.tappableObject,
              backgroundColor: tappedObjects.includes(index) 
                ? '#B5EAD7' 
                : '#FFDFD3',
              transform: tappedObjects.includes(index) 
                ? 'scale(1.1)' 
                : 'scale(1)',
            }}
          >
            {currentEmoji}
          </button>
        ))}
      </div>
      
      {showSuccess && (
        <div style={styles.successMessage}>
          <div style={styles.successIcon}>⭐</div>
          <div style={styles.successText}>Good job!</div>
        </div>
      )}
    </div>
  );
}

function MatchNumberGame() {
  const [targetNumber, setTargetNumber] = useState(1);
  const [options, setOptions] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTryAgain, setShowTryAgain] = useState(false);
  
  const emojis = ['🍎', '🌟', '🦋', '🌸', '🐠'];
  
  useEffect(() => {
    generateRound();
  }, []);
  
  const generateRound = () => {
    const target = Math.floor(Math.random() * 6) + 3;
    setTargetNumber(target);
    
    const wrong1 = target + (Math.random() < 0.5 ? -2 : -1);
    const wrong2 = target + (Math.random() < 0.5 ? 1 : 2);
    
    const optionsArray = [
      { count: Math.max(1, wrong1), correct: false },
      { count: target, correct: true },
      { count: Math.min(10, wrong2), correct: false }
    ];
    
    for (let i = optionsArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [optionsArray[i], optionsArray[j]] = [optionsArray[j], optionsArray[i]];
    }
    
    setOptions(optionsArray);
  };
  
  const handleSelect = (isCorrect) => {
    if (isCorrect) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        generateRound();
      }, 2000);
    } else {
      setShowTryAgain(true);
      setTimeout(() => {
        setShowTryAgain(false);
      }, 1500);
    }
  };
  
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
  
  return (
    <div style={styles.container}>
      <div style={styles.instructions}>
        Find the group with {targetNumber} objects
      </div>
      
      <div style={styles.targetNumberDisplay}>
        {targetNumber}
      </div>
      
      <div style={styles.matchOptionsContainer}>
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelect(option.correct)}
            style={styles.matchOption}
          >
            <div style={styles.matchOptionObjects}>
              {Array.from({ length: option.count }).map((_, i) => (
                <span key={i} style={styles.matchEmoji}>{randomEmoji}</span>
              ))}
            </div>
          </button>
        ))}
      </div>
      
      {showSuccess && (
        <div style={styles.successMessage}>
          <div style={styles.successIcon}>⭐</div>
          <div style={styles.successText}>Good job!</div>
        </div>
      )}
      
      {showTryAgain && (
        <div style={styles.tryAgainMessage}>
          <div style={styles.tryAgainText}>Try again</div>
        </div>
      )}
    </div>
  );
}

function MissingNumberGame() {
  const [sequence, setSequence] = useState([]);
  const [missingIndex, setMissingIndex] = useState(0);
  const [missingValue, setMissingValue] = useState(0);
  const [choices, setChoices] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTryAgain, setShowTryAgain] = useState(false);
  
  useEffect(() => {
    generateRound();
  }, []);
  
  const generateRound = () => {
    const start = Math.floor(Math.random() * 5) + 1;
    const seq = [start, start + 1, start + 2, start + 3];
    const missIdx = Math.floor(Math.random() * 2) + 1;
    const missVal = seq[missIdx];
    
    setMissingIndex(missIdx);
    setMissingValue(missVal);
    setSequence(seq);
    
    const wrong1 = missVal + (Math.random() < 0.5 ? -1 : 1);
    const wrong2 = missVal + (Math.random() < 0.5 ? -2 : 2);
    
    const choicesArray = [
      { value: missVal, correct: true },
      { value: Math.max(1, wrong1), correct: false },
      { value: Math.max(1, wrong2), correct: false }
    ];
    
    for (let i = choicesArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choicesArray[i], choicesArray[j]] = [choicesArray[j], choicesArray[i]];
    }
    
    setChoices(choicesArray);
  };
  
  const handleChoice = (isCorrect) => {
    if (isCorrect) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        generateRound();
      }, 2000);
    } else {
      setShowTryAgain(true);
      setTimeout(() => {
        setShowTryAgain(false);
      }, 1500);
    }
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.instructions}>
        What number is missing?
      </div>
      
      <div style={styles.sequenceContainer}>
        {sequence.map((num, index) => (
          <div
            key={index}
            style={{
              ...styles.sequenceBox,
              backgroundColor: index === missingIndex ? '#FFF9E6' : '#FFFFFF'
            }}
          >
            {index === missingIndex ? '?' : num}
          </div>
        ))}
      </div>
      
      <div style={styles.choicesContainer}>
        {choices.map((choice, index) => (
          <button
            key={index}
            onClick={() => handleChoice(choice.correct)}
            style={styles.choiceButton}
          >
            {choice.value}
          </button>
        ))}
      </div>
      
      {showSuccess && (
        <div style={styles.successMessage}>
          <div style={styles.successIcon}>⭐</div>
          <div style={styles.successText}>Good job!</div>
        </div>
      )}
      
      {showTryAgain && (
        <div style={styles.tryAgainMessage}>
          <div style={styles.tryAgainText}>Try again</div>
        </div>
      )}
    </div>
  );
}

class WelcomeScreen extends Component {
  render() {
    const { onStart } = this.props;
    
    return (
      <div style={styles.welcomeContainer}>
        <div style={styles.decorCircleTopLeft}></div>
        <div style={styles.decorCircleTopRight}></div>
        
        <div style={styles.welcomeCard}>
          <div style={styles.welcomeEmoji}>🌟</div>
          
          <h1 style={styles.welcomeTitle}>
            Let's Count Together!
          </h1>
          
          <p style={styles.welcomeText}>
            A fun and gentle way to learn numbers
          </p>
          
          <button 
            onClick={onStart}
            style={styles.startButton}
          >
            Start Learning
          </button>
        </div>
        
        <div style={styles.decorCircleBottomLeft}></div>
        <div style={styles.decorCircleBottomRight}></div>
      </div>
    );
  }
}

const styles = {
  welcomeContainer: {
    width: '100vw',
    height: '100vh',
    minHeight: '100dvh',
    backgroundColor: '#E3F2FD',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Nunito', 'Comic Sans MS', sans-serif",
    padding: 'clamp(10px, 3vw, 20px)',
    boxSizing: 'border-box',
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 'clamp(20px, 4vw, 30px)',
    padding: 'clamp(30px, 6vw, 60px)',
    textAlign: 'center',
    boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
    maxWidth: 'min(90vw, 500px)',
    width: '100%',
    position: 'relative',
    zIndex: 2,
  },
  welcomeEmoji: {
    fontSize: 'clamp(60px, 15vw, 120px)',
    marginBottom: 'clamp(10px, 2vh, 20px)',
    animation: 'gentleFloat 3s ease-in-out infinite',
  },
  welcomeTitle: {
    fontSize: 'clamp(24px, 6vw, 48px)',
    fontWeight: 'bold',
    color: '#FF9AA2',
    marginBottom: 'clamp(10px, 2vh, 20px)',
    margin: '0 0 clamp(10px, 2vh, 20px) 0',
    lineHeight: '1.2',
  },
  welcomeText: {
    fontSize: 'clamp(16px, 3.5vw, 24px)',
    color: '#7B8FA1',
    marginBottom: 'clamp(20px, 4vh, 30px)',
    lineHeight: '1.6',
  },
  startButton: {
    fontSize: 'clamp(18px, 4vw, 28px)',
    padding: 'clamp(12px, 2.5vh, 20px) clamp(30px, 6vw, 50px)',
    backgroundColor: '#FFB7B2',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 'clamp(15px, 3vw, 25px)',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 6px 20px rgba(255, 155, 162, 0.3)',
    transition: 'all 0.3s ease',
    width: '100%',
    maxWidth: '280px',
  },
  decorCircleTopLeft: {
    position: 'absolute',
    top: '-50px',
    left: '-50px',
    width: 'clamp(150px, 30vw, 300px)',
    height: 'clamp(150px, 30vw, 300px)',
    backgroundColor: '#C7CEEA',
    borderRadius: '50%',
    opacity: 0.5,
    zIndex: 1,
  },
  decorCircleTopRight: {
    position: 'absolute',
    top: '5vh',
    right: '-40px',
    width: 'clamp(120px, 25vw, 250px)',
    height: 'clamp(120px, 25vw, 250px)',
    backgroundColor: '#FFDFD3',
    borderRadius: '50%',
    opacity: 0.5,
    zIndex: 1,
  },
  decorCircleBottomLeft: {
    position: 'absolute',
    bottom: '-40px',
    left: '10vw',
    width: 'clamp(100px, 20vw, 200px)',
    height: 'clamp(100px, 20vw, 200px)',
    backgroundColor: '#B5EAD7',
    borderRadius: '50%',
    opacity: 0.5,
    zIndex: 1,
  },
  decorCircleBottomRight: {
    position: 'absolute',
    bottom: '10vh',
    right: '5vw',
    width: 'clamp(90px, 18vw, 180px)',
    height: 'clamp(90px, 18vw, 180px)',
    backgroundColor: '#FFB7B2',
    borderRadius: '50%',
    opacity: 0.4,
    zIndex: 1,
  },
  fullScreenContainer: {
    width: '100vw',
    minHeight: '100vh',
    minHeight: '100dvh',
    backgroundColor: '#F0F4F8',
    fontFamily: "'Nunito', 'Comic Sans MS', sans-serif",
    padding: 'clamp(15px, 3vw, 20px)',
    boxSizing: 'border-box',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 'clamp(28px, 6vw, 42px)',
    fontWeight: 'bold',
    color: '#FF9AA2',
    marginBottom: 'clamp(20px, 4vh, 30px)',
    textAlign: 'center',
    lineHeight: '1.2',
  },
  backButton: {
    fontSize: 'clamp(16px, 3.5vw, 20px)',
    padding: 'clamp(10px, 2vh, 12px) clamp(20px, 4vw, 24px)',
    backgroundColor: '#C7CEEA',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 'clamp(12px, 2.5vw, 15px)',
    cursor: 'pointer',
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginBottom: 'clamp(15px, 3vh, 20px)',
    transition: 'all 0.3s ease',
  },
  profileCardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(150px, 100%), 200px))',
    gap: 'clamp(15px, 3vw, 20px)',
    maxWidth: '900px',
    width: '100%',
    justifyContent: 'center',
    padding: '0 clamp(10px, 2vw, 0)',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 'clamp(15px, 3vw, 20px)',
    padding: 'clamp(20px, 4vw, 30px) clamp(15px, 3vw, 20px)',
    textAlign: 'center',
    cursor: 'pointer',
    border: 'none',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
  },
  profileAvatar: {
    fontSize: 'clamp(50px, 10vw, 60px)',
    marginBottom: 'clamp(10px, 2vh, 15px)',
  },
  profileCardName: {
    fontSize: 'clamp(18px, 4vw, 20px)',
    fontWeight: 'bold',
    color: '#7B8FA1',
    marginBottom: '5px',
  },
  profileCardAge: {
    fontSize: 'clamp(14px, 3vw, 16px)',
    color: '#A0AEC0',
  },
  createProfileCard: {
    backgroundColor: '#FFB7B2',
    borderRadius: 'clamp(15px, 3vw, 20px)',
    padding: 'clamp(20px, 4vw, 30px) clamp(15px, 3vw, 20px)',
    textAlign: 'center',
    cursor: 'pointer',
    border: 'none',
    boxShadow: '0 4px 15px rgba(255, 183, 178, 0.3)',
    transition: 'all 0.3s ease',
  },
  createProfileIcon: {
    fontSize: 'clamp(50px, 10vw, 60px)',
    color: '#FFFFFF',
    marginBottom: 'clamp(10px, 2vh, 15px)',
  },
  createProfileText: {
    fontSize: 'clamp(16px, 3.5vw, 18px)',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 'clamp(20px, 4vw, 25px)',
    padding: 'clamp(25px, 5vw, 40px)',
    maxWidth: 'min(90vw, 500px)',
    width: '100%',
    boxShadow: '0 6px 25px rgba(0,0,0,0.1)',
  },
  formGroup: {
    marginBottom: 'clamp(20px, 4vh, 30px)',
  },
  formLabel: {
    display: 'block',
    fontSize: 'clamp(16px, 3.5vw, 18px)',
    fontWeight: '600',
    color: '#7B8FA1',
    marginBottom: 'clamp(8px, 1.5vh, 10px)',
  },
  formInput: {
    width: '100%',
    fontSize: 'clamp(16px, 3.5vw, 18px)',
    padding: 'clamp(12px, 2.5vh, 15px)',
    borderRadius: 'clamp(10px, 2vw, 12px)',
    border: '2px solid #C7CEEA',
    boxSizing: 'border-box',
  },
  avatarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 'clamp(10px, 2vw, 12px)',
    marginTop: 'clamp(8px, 1.5vh, 10px)',
  },
  avatarOption: {
    fontSize: 'clamp(35px, 7vw, 40px)',
    padding: 'clamp(12px, 2.5vh, 15px)',
    border: 'none',
    borderRadius: 'clamp(12px, 2.5vw, 15px)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  saveButton: {
    width: '100%',
    fontSize: 'clamp(18px, 4vw, 22px)',
    padding: 'clamp(14px, 3vh, 18px)',
    backgroundColor: '#B5EAD7',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 'clamp(12px, 2.5vw, 15px)',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 6px 20px rgba(181, 234, 215, 0.3)',
    transition: 'all 0.3s ease',
  },
  dashboardHeader: {
    textAlign: 'center',
    marginBottom: 'clamp(25px, 5vh, 40px)',
  },
  dashboardAvatar: {
    fontSize: 'clamp(70px, 15vw, 90px)',
    marginBottom: 'clamp(10px, 2vh, 15px)',
  },
  dashboardName: {
    fontSize: 'clamp(28px, 6vw, 36px)',
    fontWeight: 'bold',
    color: '#FF9AA2',
    margin: '0 0 clamp(8px, 1.5vh, 10px) 0',
    lineHeight: '1.2',
  },
  dashboardAge: {
    fontSize: 'clamp(16px, 3.5vw, 20px)',
    color: '#7B8FA1',
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 'clamp(15px, 3vw, 20px)',
    padding: 'clamp(20px, 4vw, 30px)',
    maxWidth: 'min(90vw, 500px)',
    width: '100%',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    marginBottom: 'clamp(20px, 4vh, 30px)',
  },
  statsTitle: {
    fontSize: 'clamp(20px, 4.5vw, 24px)',
    fontWeight: 'bold',
    color: '#7B8FA1',
    marginBottom: 'clamp(15px, 3vh, 20px)',
    textAlign: 'center',
  },
  statsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(12px, 2.5vh, 15px)',
  },
  statItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'clamp(12px, 2.5vh, 15px)',
    backgroundColor: '#F0F4F8',
    borderRadius: 'clamp(10px, 2vw, 12px)',
    flexWrap: 'wrap',
    gap: '8px',
  },
  statName: {
    fontSize: 'clamp(16px, 3.5vw, 18px)',
    color: '#7B8FA1',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 'clamp(16px, 3.5vw, 18px)',
    color: '#FF9AA2',
    fontWeight: 'bold',
  },
  startGameButton: {
    fontSize: 'clamp(20px, 4.5vw, 24px)',
    padding: 'clamp(15px, 3vh, 20px) clamp(35px, 7vw, 50px)',
    backgroundColor: '#FFB7B2',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 'clamp(15px, 3vw, 20px)',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 6px 20px rgba(255, 183, 178, 0.3)',
    transition: 'all 0.3s ease',
  },
  gameGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(150px, 100%), 200px))',
    gap: 'clamp(15px, 4vw, 25px)',
    maxWidth: '900px',
    width: '100%',
    justifyContent: 'center',
    padding: '0 clamp(10px, 2vw, 0)',
  },
  gameCard: {
    padding: 'clamp(30px, 6vw, 40px) clamp(15px, 3vw, 20px)',
    border: 'none',
    borderRadius: 'clamp(20px, 4vw, 25px)',
    cursor: 'pointer',
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: 'bold',
    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
    transition: 'all 0.3s ease',
  },
  gameEmoji: {
    fontSize: 'clamp(50px, 10vw, 60px)',
    marginBottom: 'clamp(10px, 2vh, 15px)',
  },
  gameName: {
    fontSize: 'clamp(18px, 4vw, 22px)',
  },
  gameWrapper: {
    width: '100vw',
    height: '100vh',
    minHeight: '100dvh',
    backgroundColor: '#F0F4F8',
    fontFamily: "'Nunito', 'Comic Sans MS', sans-serif",
    padding: 'clamp(10px, 2vw, 15px)',
    boxSizing: 'border-box',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  gameBackButton: {
    fontSize: 'clamp(16px, 3.5vw, 18px)',
    padding: 'clamp(10px, 2vh, 12px) clamp(20px, 4vw, 24px)',
    backgroundColor: '#C7CEEA',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 'clamp(12px, 2.5vw, 15px)',
    cursor: 'pointer',
    fontWeight: '600',
    marginBottom: 'clamp(10px, 2vh, 15px)',
    alignSelf: 'flex-start',
  },
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: 'min(95vw, 1000px)',
    margin: '0 auto',
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 'clamp(20px, 4vw, 30px)',
    padding: 'clamp(15px, 3vh, 25px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    overflow: 'auto',
  },
  numberDisplay: {
    fontSize: 'clamp(60px, 15vw, 90px)',
    fontWeight: 'bold',
    color: '#FF9AA2',
    padding: 'clamp(5px, 1vh, 10px)',
    flexShrink: 0,
  },
  objectContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    overflow: 'auto',
    minHeight: 0,
    padding: 'clamp(10px, 2vh, 20px) 0',
  },
  objectGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'clamp(10px, 2.5vw, 18px)',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '100%',
    padding: 'clamp(5px, 1vh, 10px)',
  },
  object: {
    fontSize: 'clamp(40px, 10vw, 60px)',
    transition: 'all 0.6s ease',
    opacity: 0,
    transform: 'scale(0.3)',
  },
  buttonContainer: {
    display: 'flex',
    gap: 'clamp(12px, 3vw, 30px)',
    justifyContent: 'center',
    flexShrink: 0,
    paddingTop: 'clamp(10px, 2vh, 15px)',
    flexWrap: 'wrap',
  },
  navButton: {
    fontSize: 'clamp(16px, 3.5vw, 20px)',
    padding: 'clamp(12px, 2.5vh, 16px) clamp(25px, 5vw, 40px)',
    backgroundColor: '#B5EAD7',
    border: 'none',
    borderRadius: 'clamp(15px, 3vw, 20px)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: '700',
    color: '#FFFFFF',
    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
  },
  instructions: {
    fontSize: 'clamp(18px, 4vw, 24px)',
    color: '#7B8FA1',
    fontWeight: '600',
    flexShrink: 0,
    padding: '0 clamp(10px, 2vw, 20px)',
    lineHeight: '1.4',
  },
  counter: {
    fontSize: 'clamp(24px, 5vw, 36px)',
    fontWeight: 'bold',
    color: '#FF9AA2',
    padding: 'clamp(10px, 2vh, 14px) clamp(20px, 4vw, 28px)',
    backgroundColor: '#FFF0F0',
    borderRadius: 'clamp(15px, 3vw, 20px)',
    display: 'inline-block',
    minWidth: 'clamp(120px, 25vw, 160px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    flexShrink: 0,
  },
  tappableObject: {
    fontSize: 'clamp(40px, 10vw, 60px)',
    padding: 'clamp(10px, 2vh, 15px)',
    border: 'none',
    borderRadius: 'clamp(12px, 2.5vw, 15px)',
    cursor: 'pointer',
    transition: 'all 0.4s ease',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    minWidth: 'clamp(60px, 12vw, 80px)',
    minHeight: 'clamp(60px, 12vw, 80px)',
  },
  successMessage: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#FFF9E6',
    padding: 'clamp(30px, 6vw, 50px)',
    borderRadius: 'clamp(20px, 4vw, 30px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    animation: 'fadeIn 0.6s ease',
    zIndex: 100,
    maxWidth: '90vw',
  },
  successIcon: {
    fontSize: 'clamp(60px, 12vw, 90px)',
    marginBottom: 'clamp(10px, 2vh, 15px)',
    animation: 'gentleGrow 1s ease infinite',
  },
  successText: {
    fontSize: 'clamp(28px, 6vw, 42px)',
    fontWeight: 'bold',
    color: '#FF9AA2',
    lineHeight: '1.2',
  },
  tryAgainMessage: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#E3F2FD',
    padding: 'clamp(30px, 6vw, 40px) clamp(40px, 8vw, 60px)',
    borderRadius: 'clamp(20px, 4vw, 25px)',
    boxShadow: '0 6px 25px rgba(0,0,0,0.15)',
    animation: 'fadeIn 0.5s ease',
    zIndex: 100,
    maxWidth: '90vw',
  },
  tryAgainText: {
    fontSize: 'clamp(24px, 5vw, 32px)',
    fontWeight: 'bold',
    color: '#7B8FA1',
    lineHeight: '1.2',
  },
  targetNumberDisplay: {
    fontSize: 'clamp(70px, 15vw, 100px)',
    fontWeight: 'bold',
    color: '#FF9AA2',
    padding: 'clamp(5px, 1vh, 10px)',
    flexShrink: 0,
  },
  matchOptionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(15px, 3vh, 20px)',
    width: '100%',
    maxWidth: 'min(90vw, 600px)',
    padding: 'clamp(10px, 2vh, 20px)',
  },
  matchOption: {
    backgroundColor: '#FFDFD3',
    border: 'none',
    borderRadius: 'clamp(15px, 3vw, 20px)',
    padding: 'clamp(20px, 4vh, 25px)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  },
  matchOptionObjects: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'clamp(10px, 2vw, 12px)',
    justifyContent: 'center',
  },
  matchEmoji: {
    fontSize: 'clamp(35px, 7vw, 50px)',
  },
  sequenceContainer: {
    display: 'flex',
    gap: 'clamp(10px, 2.5vw, 15px)',
    justifyContent: 'center',
    marginBottom: 'clamp(20px, 4vh, 30px)',
    flexWrap: 'wrap',
    padding: '0 clamp(10px, 2vw, 0)',
  },
  sequenceBox: {
    fontSize: 'clamp(45px, 10vw, 70px)',
    fontWeight: 'bold',
    color: '#FF9AA2',
    width: 'clamp(70px, 15vw, 100px)',
    height: 'clamp(70px, 15vw, 100px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'clamp(12px, 2.5vw, 15px)',
    border: '3px solid #C7CEEA',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  choicesContainer: {
    display: 'flex',
    gap: 'clamp(15px, 3vw, 20px)',
    justifyContent: 'center',
    flexWrap: 'wrap',
    padding: '0 clamp(10px, 2vw, 0)',
  },
  choiceButton: {
    fontSize: 'clamp(35px, 8vw, 50px)',
    fontWeight: 'bold',
    color: '#FFFFFF',
    backgroundColor: '#B5EAD7',
    width: 'clamp(80px, 18vw, 120px)',
    height: 'clamp(80px, 18vw, 120px)',
    border: 'none',
    borderRadius: 'clamp(15px, 3vw, 20px)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
  },
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes gentleGrow {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
  
  @keyframes gentleFloat {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  }
  
  * {
    -webkit-tap-highlight-color: transparent;
  }
  
  @media (max-width: 480px) {
    button {
      min-height: 44px;
    }
  }
`;
document.head.appendChild(styleSheet);

export default App;