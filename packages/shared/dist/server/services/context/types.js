/**
 * Context types that can be requested from the ContextService
 */
export var ContextType;
(function (ContextType) {
    ContextType["USER"] = "user";
    ContextType["USER_PROFILE"] = "userProfile";
    ContextType["FITNESS_PLAN"] = "fitnessPlan";
    ContextType["DAY_OVERVIEW"] = "dayOverview";
    ContextType["CURRENT_WORKOUT"] = "currentWorkout";
    ContextType["DATE_CONTEXT"] = "dateContext";
    ContextType["TRAINING_META"] = "trainingMeta";
    ContextType["CURRENT_MICROCYCLE"] = "currentMicrocycle";
    ContextType["EXPERIENCE_LEVEL"] = "experienceLevel";
    ContextType["DAY_FORMAT"] = "dayFormat";
})(ContextType || (ContextType = {}));
