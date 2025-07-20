'use client';

import { useState } from "react";
import { Search, Calendar, Target, Timer, Activity } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { UserFitnessPlanSearchResponse, WorkoutDetails } from "@/shared/types/admin";

export function WorkoutPlanViewer() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<UserFitnessPlanSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!phoneNumber.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/fitness-plans/search?phoneNumber=${encodeURIComponent(phoneNumber)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to search');
      }
      
      setSelectedPlan(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSelectedPlan(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-admin-header text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Workout Plan Admin Portal</h1>
          <p className="text-blue-100 mt-2">View and manage client workout plans</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Client
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter phone number (e.g., +1234567890)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>
            {error && (
              <p className="text-sm text-destructive mt-2">{error}</p>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {selectedPlan && (
          <div className="space-y-6">
            {/* Client Info */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedPlan.user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedPlan.user.phoneNumber}</p>
                  </div>
                  {selectedPlan.fitnessProfile && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Age</p>
                        <p className="font-medium">{selectedPlan.fitnessProfile.age}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Skill Level</p>
                        <p className="font-medium">{selectedPlan.fitnessProfile.skillLevel}</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {selectedPlan.fitnessProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>Fitness Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Fitness Goals</p>
                      <p className="font-medium">{selectedPlan.fitnessProfile.fitnessGoals}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Exercise Frequency</p>
                      <p className="font-medium">{selectedPlan.fitnessProfile.exerciseFrequency}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Gender</p>
                      <p className="font-medium">{selectedPlan.fitnessProfile.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Skill Level</p>
                      <p className="font-medium">{selectedPlan.fitnessProfile.skillLevel}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Fitness Plans */}
            {selectedPlan.fitnessPlans.length > 0 ? (
              selectedPlan.fitnessPlans.map((plan) => (
                <div key={plan.id} className="space-y-4">
                  {/* Fitness Plan Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Fitness Plan Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Badge variant="secondary" className="mb-2">
                            {plan.programType}
                          </Badge>
                          {plan.goalStatement && (
                            <h3 className="text-lg font-semibold">{plan.goalStatement}</h3>
                          )}
                          {plan.overview && (
                            <p className="text-muted-foreground mt-2">{plan.overview}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Started: {formatDate(plan.startDate)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Mesocycles */}
                  {plan.mesocycles && plan.mesocycles.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold">Training Phases (Mesocycles)</h2>
                      {plan.mesocycles.map((mesocycle) => (
                        <Card key={mesocycle.id}>
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <Timer className="h-5 w-5" />
                                {mesocycle.phase}
                              </span>
                              <Badge variant="outline">{mesocycle.lengthWeeks} weeks</Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-6">
                              {/* Microcycles */}
                              <div>
                                <h4 className="font-semibold mb-3">Weekly Breakdown (Microcycles)</h4>
                                <div className="space-y-4">
                                  {mesocycle.microcycles.map((microcycle) => (
                                    <Card key={microcycle.id} className="bg-muted/30">
                                      <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center justify-between">
                                          <span>Week {microcycle.weekNumber}</span>
                                          <div className="flex gap-2">
                                            {microcycle.targets && (
                                              <>
                                                {(microcycle.targets as { volume?: string; intensity?: string }).volume && (
                                                  <Badge variant="secondary" className="text-xs">
                                                    Volume: {(microcycle.targets as { volume?: string; intensity?: string }).volume}
                                                  </Badge>
                                                )}
                                                {(microcycle.targets as { volume?: string; intensity?: string }).intensity && (
                                                  <Badge variant="secondary" className="text-xs">
                                                    Intensity: {(microcycle.targets as { volume?: string; intensity?: string }).intensity}
                                                  </Badge>
                                                )}
                                              </>
                                            )}
                                          </div>
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                          {formatDate(microcycle.startDate)} - {formatDate(microcycle.endDate)}
                                        </p>
                                      </CardHeader>
                                      <CardContent>
                                        {/* Workouts */}
                                        {microcycle.workouts.length > 0 ? (
                                          <div className="space-y-3">
                                            {microcycle.workouts.map((workout) => (
                                              <Card key={workout.id} className="bg-card">
                                                <CardHeader className="pb-2">
                                                  <CardTitle className="text-sm flex items-center justify-between">
                                                    <span className="flex items-center gap-2">
                                                      <Activity className="h-4 w-4" />
                                                      {workout.sessionType}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                      {formatDate(workout.date)}
                                                    </span>
                                                  </CardTitle>
                                                  {workout.goal && (
                                                    <p className="text-xs text-muted-foreground">{workout.goal}</p>
                                                  )}
                                                </CardHeader>
                                                <CardContent>
                                                  <div className="space-y-2">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                      <div>
                                                        <h5 className="text-sm font-medium mb-2">Workout Details</h5>
                                                        <div className="space-y-2">
                                                          {workout.details && typeof workout.details === 'object' && 'blocks' in workout.details ? (
                                                            (workout.details as WorkoutDetails).blocks?.map((block, blockIdx) => (
                                                              <div key={blockIdx} className="space-y-1">
                                                                <p className="text-xs font-semibold">{block.label}</p>
                                                                <div className="space-y-1">
                                                                  {block.activities?.map((activity: string, actIdx: number) => (
                                                                    <div key={actIdx} className="text-xs bg-muted/50 p-2 rounded">
                                                                      {activity}
                                                                    </div>
                                                                  )) || <span className="text-xs text-muted-foreground">No activities</span>}
                                                                </div>
                                                              </div>
                                                            ))
                                                          ) : workout.details && typeof workout.details === 'object' && 'exercises' in workout.details ? (
                                                            // Fallback for the expected structure
                                                            (workout.details as WorkoutDetails).exercises?.map((exercise, idx) => (
                                                              <div key={idx} className="text-xs bg-muted/50 p-2 rounded">
                                                                <span className="font-medium">{exercise.name}</span>
                                                                <div className="text-muted-foreground">
                                                                  {exercise.sets} sets × {exercise.reps} 
                                                                  {exercise.weight && ` @ ${exercise.weight}`}
                                                                </div>
                                                              </div>
                                                            )) || <span className="text-xs text-muted-foreground">No exercises</span>
                                                          ) : (
                                                            <span className="text-xs text-muted-foreground">No workout details available</span>
                                                          )}
                                                        </div>
                                                      </div>
                                                      <div className="space-y-2">
                                                        {workout.details && typeof workout.details === 'object' && (
                                                          <>
                                                            {(workout.details as WorkoutDetails).duration && (
                                                              <div>
                                                                <span className="text-xs text-muted-foreground">Duration: </span>
                                                                <span className="text-xs font-medium">{(workout.details as WorkoutDetails).duration}</span>
                                                              </div>
                                                            )}
                                                            {(workout.details as WorkoutDetails).notes && (
                                                              <div>
                                                                <span className="text-xs text-muted-foreground">Notes: </span>
                                                                <span className="text-xs">{(workout.details as WorkoutDetails).notes}</span>
                                                              </div>
                                                            )}
                                                            {(workout.details as WorkoutDetails).targets && Array.isArray((workout.details as WorkoutDetails).targets) && (
                                                              <div>
                                                                <span className="text-xs text-muted-foreground">Targets: </span>
                                                                <div className="mt-1 space-y-1">
                                                                  {(workout.details as WorkoutDetails).targets?.map((target, idx) => (
                                                                    <div key={idx} className="text-xs">
                                                                      {target.key}: {target.value}
                                                                    </div>
                                                                  ))}
                                                                </div>
                                                              </div>
                                                            )}
                                                          </>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </CardContent>
                                              </Card>
                                            ))}
                                          </div>
                                        ) : (
                                          <p className="text-sm text-muted-foreground italic">No workouts scheduled for this week</p>
                                        )}
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">No fitness plans found for this user</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {!selectedPlan && !isLoading && !error && (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Search for a Client</h3>
              <p className="text-muted-foreground">Enter a phone number above to view their workout plan details</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}