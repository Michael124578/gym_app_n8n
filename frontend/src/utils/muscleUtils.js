// Centralized Muscle Mapping & Normalization Utilities

// Map exercise keywords to canonical muscle group keys
export const extractTargetMusclesFromExercises = (exercises = []) => {
  const primary = new Set()
  
  exercises.forEach((ex) => {
    const name = (ex.name || '').toLowerCase()
    const muscle = (ex.muscle || '').toLowerCase()

    if (muscle === 'chest' || name.includes('bench') || name.includes('chest') || name.includes('fly') || name.includes('push')) {
      primary.add('chest')
    }
    if (muscle === 'shoulders' || name.includes('press') || name.includes('delt') || name.includes('overhead') || name.includes('shoulder')) {
      primary.add('shoulders')
    }
    if (muscle === 'back' || name.includes('row') || name.includes('pull') || name.includes('lat') || name.includes('back')) {
      primary.add('back')
    }
    if (muscle === 'quads' || muscle === 'legs' || name.includes('squat') || name.includes('lunge') || name.includes('leg') || name.includes('quad')) {
      primary.add('quads')
    }
    if (muscle === 'biceps' || name.includes('curl') || name.includes('bicep')) {
      primary.add('biceps')
    }
    if (muscle === 'triceps' || name.includes('extension') || name.includes('tricep') || name.includes('dip')) {
      primary.add('triceps')
    }
    if (muscle === 'abs' || name.includes('crunch') || name.includes('abs') || name.includes('core')) {
      primary.add('abs')
    }
  })

  return Array.from(primary)
}
