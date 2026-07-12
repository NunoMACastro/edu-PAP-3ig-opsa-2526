/**
 * @file Extensões de asserção DOM partilhadas pelos testes Vitest da OPSA.
 */

import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => cleanup());
