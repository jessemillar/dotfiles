// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import * as vscode from "vscode";

import { validateAndRecommendExtension } from "../recommendation";
import { sendInfo } from "vscode-extension-telemetry-wrapper";
import { getReleaseNotesEntries, findLatestReleaseNotes } from "../utils";
import { gt, eq } from "semver";

export async function createMavenProjectCmdHanlder(context: vscode.ExtensionContext) {
  if (!await validateAndRecommendExtension("vscjava.vscode-maven", "Maven extension is recommended to help create Java projects and work with custom goals.", true)) {
    return;
  }

  await vscode.commands.executeCommand("maven.archetype.generate");
}

// TODO: add entry to create standalone Java file

export async function createSpringBootProjectCmdHandler(context: vscode.ExtensionContext) {
  if (!await validateAndRecommendExtension("vscjava.vscode-spring-initializr", "Spring Initializr extension is recommended to help create Spring Boot projects and manage dependencies.", true)) {
    return;
  }

  await vscode.commands.executeCommand("spring.initializr.createProject");
}

export async function showExtensionCmdHandler(context: vscode.ExtensionContext, operationId: string, extensionName: string) {
  sendInfo(operationId, { extName: extensionName });
  vscode.commands.executeCommand("extension.open", extensionName);
}

export async function openUrlCmdHandler(context: vscode.ExtensionContext, operationId: string, url: string) {
  sendInfo(operationId, { url: url });
  vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(url));
}

export async function showReleaseNotes(context: vscode.ExtensionContext, operationId: string, version: string) {
  let path = context.asAbsolutePath(`release-notes/v${version}.md`);
  vscode.commands.executeCommand("markdown.showPreview", vscode.Uri.file(path), null, {
    sideBySide: false,
    locked: true
  });
}

export async function showReleaseNotesHandler(context: vscode.ExtensionContext, operationId: string, version: string | undefined) {
  const entries = await getReleaseNotesEntries(context);
  const latest = findLatestReleaseNotes(entries);

  if (version === "latest") {
    version = latest.version;
  }

  if (version === undefined) {
    const versions = entries.map((entry) => entry.version).sort((a, b) => {
      if (gt(a, b)) {
        return -1;
      } else if (eq(a, b)) {
        return 0;
      }

      return 1;
    });

    version = await vscode.window.showQuickPick(versions, {
      ignoreFocusOut: true
    });

    if (!version) {
      return;
    }
  }

  sendInfo(operationId, {
    version: version
  });

  return await showReleaseNotes(context, operationId, version);
}
