"use client";

import { apiClient } from "@/lib/api-client";
import { ApiResponse } from "@/types/api";
import { Control, CreateControlPayload, CreatePatternPayload, Pattern } from "@/types/pattern";
import { useState, useCallback } from "react";

function normalizePattern(pattern: Pattern & { controlsList?: Control[]; controlsCount?: number }): Pattern {
  const backendControls = Array.isArray(pattern.controlsList) ? pattern.controlsList : [];

  return {
    ...pattern,
    controlsList: backendControls,
    controlsCount: backendControls.length,
  };
}

interface UsePatternReturn {
  patterns: Pattern[];
  loading: boolean;
  error: string | null;
  fetchPatterns: () => Promise<void>;
  createPattern: (payload: CreatePatternPayload) => Promise<Pattern>;
  createControl: (payload: CreateControlPayload) => Promise<Control>;
  getPatternControls: (patternId: string) => Promise<Control[]>;
  deletePattern: (patternId: string) => Promise<void>;
  deleteControl: (controlId: string) => Promise<void>;
}

export function usePattern(): UsePatternReturn {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatterns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient<ApiResponse<Pattern[]>>("/api/patterns");
      const rawPatterns = Array.isArray((response as unknown as Pattern[]))
        ? (response as unknown as Pattern[])
        : Array.isArray(response.data)
          ? response.data
          : [];

      setPatterns(rawPatterns.filter(Boolean).map((pattern) => normalizePattern(pattern)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching patterns");
      setPatterns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPattern = useCallback(
    async (payload: CreatePatternPayload): Promise<Pattern> => {
      setLoading(true);
      setError(null);
      try {
        const {
          name,
          description,
          keyControlAreas,
          whenToUse,
          whenNotToUse,
          typicalChallenges,
          threatResistance,
          assumptions,
          developmentAreas,
        } = payload;

        const response = await apiClient<ApiResponse<Pattern>>("/api/patterns", {
          method: "POST",
          body: JSON.stringify({
            name,
            description,
            keyControlAreas,
            whenToUse,
            whenNotToUse,
            typicalChallenges,
            threatResistance,
            assumptions,
            developmentAreas,
          }),
        });
        const newPattern = normalizePattern(response.data);
        if (!newPattern) {
          throw new Error("Backend returned an empty pattern response");
        }
        setPatterns((prev) => [...prev, newPattern]);
        return newPattern;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Error creating pattern";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createControl = useCallback(
    async (payload: CreateControlPayload): Promise<Control> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient<ApiResponse<Control>>("/api/controls", {
          method: "POST",
          body: JSON.stringify({
            name: payload.name,
            description: payload.description,
            patternId: payload.patternId,
          }),
        });

        const backendControl = response.data;
        setPatterns((prev) =>
          prev.map((pattern) =>
            pattern.id === payload.patternId
              ? {
                  ...pattern,
                  controlsList: [...(pattern.controlsList || []), backendControl],
                  controlsCount: (pattern.controlsCount || 0) + 1,
                }
              : pattern
          )
        );

        return backendControl;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Error creating control";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getPatternControls = useCallback(async (patternId: string): Promise<Control[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient<ApiResponse<Control[]>>("/api/controls");
      const controls = Array.isArray(response.data) ? response.data : [];
      return controls.filter((control) => control.patternId === patternId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching controls");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePattern = useCallback(async (patternId: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient(`/api/patterns/${patternId}`, {
        method: "DELETE",
      });
      setPatterns((prev) => prev.filter((p) => p.id !== patternId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting pattern");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteControl = useCallback(async (controlId: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient(`/api/controls/${controlId}`, {
        method: "DELETE",
      });
      setPatterns((prev) =>
        prev.map((pattern) => {
          const nextControls = (pattern.controlsList || []).filter((control) => control.id !== controlId);
          return {
            ...pattern,
            controlsList: nextControls,
            controlsCount: nextControls.length,
          };
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting control");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    patterns,
    loading,
    error,
    fetchPatterns,
    createPattern,
    createControl,
    getPatternControls,
    deletePattern,
    deleteControl,
  };
}
