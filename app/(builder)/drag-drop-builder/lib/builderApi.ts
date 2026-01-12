/**
 * API functions for the drag-drop-builder
 */

import { Component } from '../types';
import { getBaseUrl } from './builderUtils';

/**
 * Load theme components from the server
 */
export async function loadTheme(
  themeFolder: string,
  standaloneServer: boolean
): Promise<Component[]> {
  const baseUrl = getBaseUrl(standaloneServer);
  const url = standaloneServer
    ? `${baseUrl}/theme?name=${themeFolder}`
    : `${baseUrl}?type=theme&name=${themeFolder}`;

  const response = await fetch(url);
  const components = await response.json();
  return components;
}

/**
 * Save page HTML to the server
 */
export async function savePage(
  html: string,
  standaloneServer: boolean
): Promise<void> {
  const baseUrl = getBaseUrl(standaloneServer);
  const url = standaloneServer
    ? `${baseUrl}/data?path=${location.pathname}&ext=html`
    : `${baseUrl}?type=data&path=${location.pathname}&ext=html`;

  await fetch(url, {
    method: 'POST',
    body: html,
  });
}

/**
 * Load page HTML from the server
 */
export async function loadPage(standaloneServer: boolean): Promise<string> {
  const baseUrl = getBaseUrl(standaloneServer);
  const url = standaloneServer
    ? `${baseUrl}/data?path=${location.pathname}&ext=html`
    : `${baseUrl}?type=data&path=${location.pathname}&ext=html`;

  const response = await fetch(url);
  const html = await response.text();
  return html;
}

/**
 * Upload image files to the server
 */
export async function uploadImage(
  file: File,
  standaloneServer: boolean
): Promise<string[]> {
  const baseUrl = getBaseUrl(standaloneServer);
  const url = standaloneServer
    ? `${baseUrl}/data?path=${location.pathname}`
    : `${baseUrl}?type=data&path=${location.pathname}`;

  const formData = new FormData();
  formData.append('file-0', file);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  const urls = await response.json();
  return urls;
}
