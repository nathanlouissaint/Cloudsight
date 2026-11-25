import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { PortfolioProject, type PortfolioProjectData } from "../src/pages/PortfolioProject";

const base: PortfolioProjectData = { id: "forma", name: "Forma", category: "SaaS", subtitle: "Website", description: "Description", image: "/forma.webp", imageAlt: "Forma preview", features: ["Design"], disclosure: "Concept", demoUrl: "/work/saas-growth-system/demo", ctaLabel: "Explore Live Demo" };
test("portfolio projects preserve Forma navigation and open external projects safely", () => {
  const html = renderToStaticMarkup(<MemoryRouter><PortfolioProject project={base}/><PortfolioProject project={{...base, id:"aether", name:"Aether", demoUrl:"https://aether-b1on.onrender.com", external:true}}/></MemoryRouter>);
  assert.ok(html.indexOf('<h3>Forma</h3>') < html.indexOf('<h3>Aether</h3>'));
  assert.equal((html.match(/href="\/work\/saas-growth-system\/demo"/g) ?? []).length, 2);
  assert.equal((html.match(/href="https:\/\/aether-b1on.onrender.com"/g) ?? []).length, 2);
  assert.equal((html.match(/target="_blank" rel="noopener noreferrer"/g) ?? []).length, 2);
});
