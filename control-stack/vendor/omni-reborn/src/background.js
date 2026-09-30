let actions = [];
let newtaburl = "";

// Clear actions and append default ones
const clearActions = () => {
	getCurrentTab().then((response) => {
		actions = [];
		const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
		let muteaction = {title:"Mute tab", desc:"Mute the current tab", type:"action", action:"mute", emoji:true, emojiChar:"🔇", keycheck:true, keys:['⌥','⇧', 'M']};
		let pinaction = {title:"Pin tab", desc:"Pin the current tab", type:"action", action:"pin", emoji:true, emojiChar:"📌", keycheck:true, keys:['⌥','⇧', 'P']};
		if (response.mutedInfo.muted) {
			muteaction = {title:"Unmute tab", desc:"Unmute the current tab", type:"action", action:"unmute", emoji:true, emojiChar:"🔈", keycheck:true, keys:['⌥','⇧', 'M']};
		}
		if (response.pinned) {
			pinaction = {title:"Unpin tab", desc:"Unpin the current tab", type:"action", action:"unpin", emoji:true, emojiChar:"📌", keycheck:true, keys:['⌥','⇧', 'P']};
		}
		actions = [
			{title:"New tab", desc:"Open a new tab", type:"action", action:"new-tab", emoji:true, emojiChar:"✨", keycheck:true, keys:['⌘','T']},
			{title:"Bookmark", desc:"Create a bookmark", type:"action", action:"create-bookmark", emoji:true, emojiChar:"📕", keycheck:true, keys:['⌘','D']},
			pinaction,
			{title:"Fullscreen", desc:"Make the page fullscreen", type:"action", action:"fullscreen", emoji:true, emojiChar:"🖥", keycheck:true, keys:['⌘', 'Ctrl', 'F']},
			muteaction,
			{title:"Reload", desc:"Reload the page", type:"action", action:"reload", emoji:true, emojiChar:"♻️", keycheck:true, keys:['⌘','⇧', 'R']},
			{title:"Help", desc:"Get help with Omni on GitHub", type:"action", action:"url", url:"https://github.com/alyssaxuu/omni", emoji:true, emojiChar:"🤔", keycheck:false},
			{title:"Compose email", desc:"Compose a new email", type:"action", action:"email", emoji:true, emojiChar:"✉️", keycheck:true, keys:['⌥','⇧', 'C']},
			{title:"Print page", desc:"Print the current page", type:"action", action:"print", emoji:true, emojiChar:"🖨️", keycheck:true, keys:['⌘', 'P']},
			{title:"New Notion page", desc:"Create a new Notion page", type:"action", action:"url", url:"https://notion.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-notion.png"), keycheck:false},
			{title:"New Sheets spreadsheet", desc:"Create a new Google Sheets spreadsheet", type:"action", action:"url", url:"https://sheets.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-sheets.png"), keycheck:false},
			{title:"New Docs document", desc:"Create a new Google Docs document", type:"action", action:"url", emoji:false, url:"https://docs.new", favIconUrl:chrome.runtime.getURL("assets/logo-docs.png"), keycheck:false},
			{title:"New Slides presentation", desc:"Create a new Google Slides presentation", type:"action", action:"url", url:"https://slides.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-slides.png"), keycheck:false},
			{title:"New form", desc:"Create a new Google Forms form", type:"action", action:"url", url:"https://forms.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-forms.png"), keycheck:false},
			{title:"New Medium story", desc:"Create a new Medium story", type:"action", action:"url", url:"https://story.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-medium.png"), keycheck:false},
			{title:"New GitHub repository", desc:"Create a new GitHub repository", type:"action", action:"url", url:"https://github.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-github.png"), keycheck:false},
			{title:"New GitHub gist", desc:"Create a new GitHub gist", type:"action", action:"url", url:"https://gist.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-github.png"), keycheck:false},
			{title:"New CodePen pen", desc:"Create a new CodePen pen", type:"action", action:"url", url:"https://pen.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-codepen.png"), keycheck:false},
			{title:"New Excel spreadsheet", desc:"Create a new Excel spreadsheet", type:"action", action:"url", url:"https://excel.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-excel.png"), keycheck:false},
			{title:"New PowerPoint presentation", desc:"Create a new PowerPoint presentation", type:"action", url:"https://powerpoint.new", action:"url", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-powerpoint.png"), keycheck:false},
			{title:"New Word document", desc:"Create a new Word document", type:"action", action:"url", url:"https://word.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-word.png"), keycheck:false},
			{title:"Create a whiteboard", desc:"Create a collaborative whiteboard", type:"action", action:"url", url:"https://whiteboard.new", emoji:true, emojiChar:"🧑‍🏫", keycheck:false},
			{title:"Record a video", desc:"Record and edit a video", type:"action", action:"url", url:"https://recording.new", emoji:true, emojiChar:"📹", keycheck:false},
			{title:"Create a Figma file", desc:"Create a new Figma file", type:"action", action:"url", url:"https://figma.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-figma.png"), keycheck:false},
			{title:"Create a FigJam file", desc:"Create a new FigJam file", type:"action", action:"url", url:"https://figjam.new", emoji:true, emojiChar:"🖌", keycheck:false},
			{title:"Hunt a product", desc:"Submit a product to Product Hunt", type:"action", action:"url", url:"https://www.producthunt.com/posts/new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-producthunt.png"), keycheck:false},
			{title:"Make a tweet", desc:"Make a tweet on Twitter", type:"action", action:"url", url:"https://twitter.com/intent/tweet", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-twitter.png"), keycheck:false},
			{title:"Create a playlist", desc:"Create a Spotify playlist", type:"action", action:"url", url:"https://playlist.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-spotify.png"), keycheck:false},
			{title:"Create a Canva design", desc:"Create a new design with Canva", type:"action", action:"url", url:"https://design.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-canva.png"), keycheck:false},
			{title:"Create a new podcast episode", desc:"Create a new podcast episode with Anchor", type:"action", action:"url", url:"https://episode.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-anchor.png"), keycheck:false},
			{title:"Edit an image", desc:"Edit an image with Adobe Photoshop", type:"action", action:"url", url:"https://photo.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-photoshop.png"), keycheck:false},
			{title:"Convert to PDF", desc:"Convert a file to PDF", type:"action", action:"url", url:"https://pdf.new", emoji:true, emojiChar:"📄", keycheck:false},
			{title:"Scan a QR code", desc:"Scan a QR code with your camera", type:"action", action:"url", url:"https://scan.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-qr.png"), keycheck:false},
			{title:"Add a task to Asana", desc:"Create a new task in Asana", type:"action", action:"url", url:"https://task.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-asana.png"), keycheck:false},
			{title:"Add an issue to Linear", desc:"Create a new issue in Linear", type:"action", action:"url", url:"https://linear.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-linear.png"), keycheck:false},
			{title:"Add a task to WIP", desc:"Create a new task in WIP", type:"action", action:"url", url:"https://todo.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-wip.png"), keycheck:false},
			{title:"Create an event", desc:"Add an event to Google Calendar", type:"action", action:"url", url:"https://cal.new", emoji:false, favIconUrl:chrome.runtime.getURL("assets/logo-calendar.png"), keycheck:false},
			{title:"Add a note", desc:"Add a note to Google Keep", type:"action", action:"url", emoji:false, url:"https://note.new", favIconUrl:chrome.runtime.getURL("assets/logo-keep.png"), keycheck:false},
			{title:"New meeting", desc:"Start a Google Meet meeting", type:"action", action:"url", emoji:false, url:"https://meet.new", favIconUrl:chrome.runtime.getURL("assets/logo-meet.png"), keycheck:false},
			{title:"Browsing history", desc:"Browse through your browsing history", type:"action", action:"history", emoji:true, emojiChar:"🗂", keycheck:true, keys:['⌘','Y']},
			{title:"Incognito mode", desc:"Open an incognito window", type:"action", action:"incognito", emoji:true, emojiChar:"🕵️", keycheck:true, keys:['⌘','⇧', 'N']},
			{title:"Downloads", desc:"Browse through your downloads", type:"action", action:"downloads", emoji:true, emojiChar:"📦", keycheck:true, keys:['⌘','⇧', 'J']},
			{title:"Extensions", desc:"Manage your Chrome Extensions", type:"action", action:"extensions", emoji:true, emojiChar:"🧩", keycheck:false, keys:['⌘','D']},
			{title:"Chrome settings", desc:"Open the Chrome settings", type:"action", action:"settings", emoji:true, emojiChar:"⚙️", keycheck:true, keys:['⌘',',']},
			{title:"Scroll to bottom", desc:"Scroll to the bottom of the page", type:"action", action:"scroll-bottom", emoji:true, emojiChar:"👇", keycheck:true, keys:['⌘','↓']},
			{title:"Scroll to top", desc:"Scroll to the top of the page", type:"action", action:"scroll-top", emoji:true, emojiChar:"👆", keycheck:true, keys:['⌘','↑']},
			{title:"Go back", desc:"Go back in history for the current tab", type:"action", action:"go-back", emoji:true, emojiChar:"👈",  keycheck:true, keys:['⌘','←']},
			{title:"Go forward", desc:"Go forward in history for the current tab", type:"action", action:"go-forward", emoji:true, emojiChar:"👉", keycheck:true, keys:['⌘','→']},
			{title:"Duplicate tab", desc:"Make a copy of the current tab", type:"action", action:"duplicate-tab", emoji:true, emojiChar:"📋", keycheck:true, keys:['⌥','⇧', 'D']},
			{title:"Close tab", desc:"Close the current tab", type:"action", action:"close-tab", emoji:true, emojiChar:"🗑", keycheck:true, keys:['⌘','W']},
			{title:"Close window", desc:"Close the current window", type:"action", action:"close-window", emoji:true, emojiChar:"💥", keycheck:true, keys:['⌘','⇧', 'W']},
			...getRebornActions(),
			{title:"Manage browsing data", desc:"Manage your browsing data", type:"action", action:"manage-data", emoji:true, emojiChar:"🔬", keycheck:true, keys:['⌘','⇧', 'Delete']},
			{title:"Clear all browsing data", desc:"Clear all of your browsing data", type:"action", action:"remove-all", emoji:true, emojiChar:"🧹", keycheck:false, keys:['⌘','D']},
			{title:"Clear browsing history", desc:"Clear all of your browsing history", type:"action", action:"remove-history", emoji:true, emojiChar:"🗂", keycheck:false, keys:['⌘','D']},
			{title:"Clear cookies", desc:"Clear all cookies", type:"action", action:"remove-cookies", emoji:true, emojiChar:"🍪", keycheck:false, keys:['⌘','D']},
			{title:"Clear cache", desc:"Clear the cache", type:"action", action:"remove-cache", emoji:true, emojiChar:"🗄", keycheck:false, keys:['⌘','D']},
			{title:"Clear local storage", desc:"Clear the local storage", type:"action", action:"remove-local-storage", emoji:true, emojiChar:"📦", keycheck:false, keys:['⌘','D']},
			{title:"Clear passwords", desc:"Clear all saved passwords", type:"action", action:"remove-passwords", emoji:true, emojiChar:"🔑", keycheck:false, keys:['⌘','D']},
		];

		if (!isMac) {
			for (action of actions) {
				switch (action.action) {
					case "reload":
						action.keys = ['F5'];
						break;
					case "fullscreen":
						action.keys = ['F11'];
						break;
					case "downloads":
						action.keys = ['Ctrl', 'J'];
						break;
					case "settings":
						action.keycheck = false;
						break;
					case "history":
						action.keys = ['Ctrl', 'H'];
						break;
					case "go-back":
						action.keys = ['Alt','←'];
						break;
					case "go-forward":
						action.keys = ['Alt','→']
						break;
					case "scroll-top":
						action.keys = ['Home'];
						break;
					case "scroll-bottom":
						action.keys = ['End'];
						break;
				}
				for (const key in action.keys) {
					if (action.keys[key] === "⌘") {
						action.keys[key] = "Ctrl";
					} else if (action.keys[key] === "⌥") {
						action.keys[key] = "Alt";
					}
				};
			};
		}
	});
}

// Open on install
chrome.runtime.onInstalled.addListener((object) => {
  // Inject Omni on install
  const manifest = chrome.runtime.getManifest();

  const injectIntoTab = (tab) => {
    const scripts = manifest.content_scripts[0].js;
    const s = scripts.length;

    for (let i = 0; i < s; i++) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: [scripts[i]],
      });
    }

    chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: [manifest.content_scripts[0].css[0]],
    });
  };

  // Get all windows
  chrome.windows.getAll(
    {
      populate: true,
    },
    (windows) => {
      let currentWindow;
      const w = windows.length;

      for (let i = 0; i < w; i++) {
        currentWindow = windows[i];

        let currentTab;
        const t = currentWindow.tabs.length;

        for (let j = 0; j < t; j++) {
          currentTab = currentWindow.tabs[j];
					if (!currentTab.url.includes("chrome://") && !currentTab.url.includes("chrome-extension://") && !currentTab.url.includes("chrome.google.com")) {
          	injectIntoTab(currentTab);
					}
        }
      }
    }
  );

  // Omni Reborn: no welcome page is opened on install (no network calls)
});

// Check when the extension button is clicked
chrome.action.onClicked.addListener((tab) => {
	chrome.tabs.sendMessage(tab.id, {request: "open-omni"});
});

// Listen for the open omni shortcut
chrome.commands.onCommand.addListener((command) => {
	if (REBORN_COMMANDS.includes(command)) {
		getCurrentTab().then((tab) => {
			if (!tab) return;
			runRebornAction(command, tab.id).then((result) => notifyResult(tab.id, result));
		});
		return;
	}
	if (command === "open-omni") {
		getCurrentTab().then((response) => {
			if (!response.url.includes("chrome://") && !response.url.includes("chrome.google.com")) {
				chrome.tabs.sendMessage(response.id, {request: "open-omni"});
			} else {
				chrome.tabs.create({
					url: "./newtab.html"	
				}).then(() => {
					newtaburl = response.url;
					chrome.tabs.remove(response.id);
				})
			}
		});
	}
});

// Get the current tab
const getCurrentTab = async () => {
	const queryOptions = { active: true, currentWindow: true };
	const [tab] = await chrome.tabs.query(queryOptions);
	return tab;
}

// Restore the new tab page (workaround to show Omni in new tab page)
function restoreNewTab() {
	getCurrentTab().then((response) => {
		chrome.tabs.create({
			url: newtaburl
		}).then(() => {
			chrome.tabs.remove(response.id);
		})
	})
}

const resetOmni = () => {
	refreshCommandShortcuts();
	clearActions();
	getTabs();
	getBookmarks();
	var search = [
		{title:"Search", desc:"Search for a query", type:"action", action:"search", emoji:true, emojiChar:"🔍", keycheck:false},
		{title:"Search", desc:"Go to website", type:"action", action:"goto", emoji:true, emojiChar:"🔍", keycheck:false}
	];
	actions = search.concat(actions);
}

// Check if tabs have changed and actions need to be fetched again
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => resetOmni());
chrome.tabs.onCreated.addListener((tab) => resetOmni());
chrome.tabs.onRemoved.addListener((tabId, changeInfo) => resetOmni());

// Get tabs to populate in the actions
const getTabs = () => {
	chrome.tabs.query({}, (tabs) => {
		tabs.forEach((tab) => {
			tab.desc = "Chrome tab";
			tab.keycheck = false;
			tab.action = "switch-tab";
			tab.type = "tab";
		})
		actions = tabs.concat(actions);
	});
}

// Get bookmarks to populate in the actions
const getBookmarks = () => {
	const process_bookmark = (bookmarks) => {
		for (const bookmark of bookmarks) {	
			if (bookmark.url) {
				actions.push({title:bookmark.title, desc:"Bookmark", id:bookmark.id, url:bookmark.url, type:"bookmark", action:"bookmark", emoji:true, emojiChar:"⭐️", keycheck:false})
			}
			if (bookmark.children) {
				process_bookmark(bookmark.children);
			}
		}
	}

	chrome.bookmarks.getRecent(100, process_bookmark);
}

// Lots of different actions
const switchTab = (tab) => {
	chrome.tabs.highlight({
		tabs: tab.index,
		windowId: tab.windowId
	})
	chrome.windows.update(
		tab.windowId,
		{ focused: true }
	)
}
const goBack = (tab) => {
	chrome.tabs.goBack({
		tabs: tab.index
	})
}
const goForward = (tab) => {
	chrome.tabs.goForward({
		tabs: tab.index
	})
}
const duplicateTab = (tab) => {
	getCurrentTab().then((response) => {
		chrome.tabs.duplicate(response.id);
	})
}
const createBookmark = (tab) => {
	getCurrentTab().then((response) => {
		chrome.bookmarks.create({
			title: response.title,
			url: response.url
		});
	})
}
const muteTab = (mute) =>{
	getCurrentTab().then((response) => {
		chrome.tabs.update(response.id, {"muted": mute})
	});
}
const reloadTab = () => {
	chrome.tabs.reload();
}
const pinTab = (pin) => {
	getCurrentTab().then((response) => {
		chrome.tabs.update(response.id, {"pinned": pin})
	});
}
const clearAllData = () => {
	chrome.browsingData.remove({
		"since": (new Date()).getTime()
	}, {
		"appcache": true,
		"cache": true,
		"cacheStorage": true,
		"cookies": true,
		"downloads": true,
		"fileSystems": true,
		"formData": true,
		"history": true,
		"indexedDB": true,
		"localStorage": true,
		"passwords": true,
		"serviceWorkers": true,
		"webSQL": true
	});
}
const clearBrowsingData = () => {
	chrome.browsingData.removeHistory({"since": 0});
}
const clearCookies = () =>{
	chrome.browsingData.removeCookies({"since": 0});
}
const clearCache = () => {
	chrome.browsingData.removeCache({"since": 0});
}
const clearLocalStorage = () => {
	chrome.browsingData.removeLocalStorage({"since": 0});
}
const clearPasswords = () => {
	chrome.browsingData.removePasswords({"since": 0});
}
const openChromeUrl = (url) => {
	chrome.tabs.create({url: 'chrome://'+url+'/'});
}
const openIncognito = () => {
	chrome.windows.create({"incognito": true});
}
const closeWindow = (id) => {
	chrome.windows.remove(id);
}
const closeTab = (tab) => {
	chrome.tabs.remove(tab.id);
}
const closeCurrentTab = () => {
	getCurrentTab().then(closeTab)
}
const removeBookmark = (bookmark) => {
	chrome.bookmarks.remove(bookmark.id);
}

// ---------------------------------------------------------------------------
// Omni Reborn: move tabs and manage tab groups from the keyboard
// ---------------------------------------------------------------------------

// Actions that are also exposed as keyboard commands (see manifest.json "commands")
const REBORN_COMMANDS = [
	"move-tab-left", "move-tab-right",
	"add-tab-to-group-left", "add-tab-to-group-right",
	"remove-tab-from-group",
	"move-group-left", "move-group-right",
	"toggle-group-collapse"
];

// Current keyboard shortcuts for our commands (refreshed from chrome.commands)
let commandShortcuts = {"move-tab-left": "Alt+Shift+Left", "move-tab-right": "Alt+Shift+Right"};
const refreshCommandShortcuts = () => {
	chrome.commands.getAll().then((commands) => {
		const shortcuts = {};
		commands.forEach((command) => { shortcuts[command.name] = command.shortcut || ""; });
		commandShortcuts = shortcuts;
	}).catch(() => {});
}

// Turn a chrome.commands shortcut ("Alt+Shift+Left" or "⌥⇧←" on Mac) into Omni key badges
const shortcutToKeys = (shortcut) => {
	if (!shortcut) return [];
	const names = {Shift:"⇧", Left:"←", Right:"→", Up:"↑", Down:"↓", "Left Arrow":"←", "Right Arrow":"→", "Up Arrow":"↑", "Down Arrow":"↓", Command:"⌘", Option:"⌥", MacCtrl:"Ctrl", Comma:",", Period:"."};
	const parts = shortcut.includes("+") ? shortcut.split("+") : Array.from(shortcut);
	return parts.map((key) => names[key] || key);
}

const rebornAction = (action, title, desc, emojiChar) => {
	const keys = shortcutToKeys(commandShortcuts[action]);
	return {title:title, desc:desc, type:"action", action:action, emoji:true, emojiChar:emojiChar, keycheck:keys.length > 0, keys:keys};
}

// Palette entries (same shape as the upstream Omni actions)
const getRebornActions = () => [
	rebornAction("move-tab-left", "Move tab left", "Move the current tab one position to the left", "⬅️"),
	rebornAction("move-tab-right", "Move tab right", "Move the current tab one position to the right", "➡️"),
	rebornAction("move-tab-start", "Move tab to start", "Move the current tab to the start of the tab strip", "⏮️"),
	rebornAction("move-tab-end", "Move tab to end", "Move the current tab to the end of the tab strip", "⏭️"),
	rebornAction("add-tab-to-group-left", "Add tab to group on the left", "Add the current tab to the nearest tab group on its left", "↩️"),
	rebornAction("add-tab-to-group-right", "Add tab to group on the right", "Add the current tab to the nearest tab group on its right", "↪️"),
	rebornAction("new-group", "New group with this tab", "Create a new tab group containing the current tab", "🏷️"),
	rebornAction("remove-tab-from-group", "Remove tab from group", "Take the current tab out of its tab group", "📤"),
	rebornAction("move-group-left", "Move group left", "Move the current tab group one step to the left", "⏪"),
	rebornAction("move-group-right", "Move group right", "Move the current tab group one step to the right", "⏩"),
	rebornAction("toggle-group-collapse", "Collapse / expand group", "Collapse or expand the current tab group", "🗜️"),
	rebornAction("close-group", "Close group", "Close every tab in the current tab group", "❌"),
];

const NO_GROUP = chrome.tabGroups ? chrome.tabGroups.TAB_GROUP_ID_NONE : -1;

// Snapshot of a tab's window: sorted tabs, pinned count, and the tab itself
const getTabContext = async (tabId) => {
	const tab = await chrome.tabs.get(tabId);
	const tabs = (await chrome.tabs.query({windowId: tab.windowId})).sort((a, b) => a.index - b.index);
	const pinnedCount = tabs.filter((t) => t.pinned).length;
	return {tab, tabs, pinnedCount};
}

// First and last index of a group (groups are always contiguous)
const groupRange = (tabs, groupId) => {
	const members = tabs.filter((t) => t.groupId === groupId);
	return {start: members[0].index, end: members[members.length - 1].index, size: members.length, tabIds: members.map((t) => t.id)};
}

const isCollapsed = async (groupId) => {
	try {
		return (await chrome.tabGroups.get(groupId)).collapsed;
	} catch (e) {
		return false;
	}
}

const done = (message) => ({ok: true, message: message || ""});
const noop = (message) => ({ok: false, message: message});

// Move a tab one position (dir = -1 left, +1 right), with Chrome's group-edge semantics:
// at its group's edge the tab first leaves the group; next to a group it joins that group;
// a collapsed group is jumped over as a whole. Pinned tabs stay in the pinned area.
const moveTabBy = async (tabId, dir) => {
	const {tab, tabs, pinnedCount} = await getTabContext(tabId);
	const i = tab.index;
	if (tab.pinned) {
		const target = i + dir;
		if (target < 0 || target >= pinnedCount) return noop(dir < 0 ? "Tab is already first" : "Tab is already the last pinned tab");
		await chrome.tabs.move(tab.id, {index: target});
		return done();
	}
	const neighbor = tabs[i + dir];
	if (tab.groupId !== NO_GROUP) {
		if (!neighbor || neighbor.groupId !== tab.groupId) {
			// At the group's edge: step out of the group (tab keeps its position)
			await chrome.tabs.ungroup(tab.id);
			return done();
		}
		await chrome.tabs.move(tab.id, {index: i + dir});
		const moved = await chrome.tabs.get(tab.id);
		if (moved.groupId !== tab.groupId) {
			await chrome.tabs.group({tabIds: tab.id, groupId: tab.groupId});
		}
		return done();
	}
	if (!neighbor || neighbor.pinned) return noop(dir < 0 ? "Tab is already at the start" : "Tab is already at the end");
	if (neighbor.groupId !== NO_GROUP) {
		if (await isCollapsed(neighbor.groupId)) {
			// Jump over the collapsed group as a whole
			const range = groupRange(tabs, neighbor.groupId);
			await chrome.tabs.move(tab.id, {index: dir < 0 ? range.start : range.end});
			return done();
		}
		// Step into the adjacent group's edge: Chrome keeps the tab in place and joins it
		await chrome.tabs.group({tabIds: tab.id, groupId: neighbor.groupId});
		return done();
	}
	await chrome.tabs.move(tab.id, {index: i + dir});
	return done();
}

// Move a tab to the start/end of its area (pinned area for pinned tabs), leaving any group
const moveTabToEdge = async (tabId, toEnd) => {
	let {tab, pinnedCount} = await getTabContext(tabId);
	if (tab.pinned) {
		await chrome.tabs.move(tab.id, {index: toEnd ? pinnedCount - 1 : 0});
		return done();
	}
	if (tab.groupId !== NO_GROUP) {
		await chrome.tabs.ungroup(tab.id);
	}
	await chrome.tabs.move(tab.id, {index: toEnd ? -1 : pinnedCount});
	return done();
}

// Add a tab to the nearest group in a direction; Chrome places it at that group's near edge
const addTabToGroupInDirection = async (tabId, dir) => {
	const {tab, tabs} = await getTabContext(tabId);
	for (let j = tab.index + dir; j >= 0 && j < tabs.length; j += dir) {
		const other = tabs[j];
		if (other.groupId !== NO_GROUP && other.groupId !== tab.groupId) {
			if (await isCollapsed(other.groupId)) {
				await chrome.tabGroups.update(other.groupId, {collapsed: false});
			}
			await chrome.tabs.group({tabIds: tab.id, groupId: other.groupId});
			return done();
		}
	}
	return noop(dir < 0 ? "No tab group to the left" : "No tab group to the right");
}

const newGroupWithTab = async (tabId) => {
	const tab = await chrome.tabs.get(tabId);
	await chrome.tabs.group({tabIds: tab.id, createProperties: {windowId: tab.windowId}});
	return done();
}

const removeTabFromGroup = async (tabId) => {
	const tab = await chrome.tabs.get(tabId);
	if (tab.groupId === NO_GROUP) return noop("Tab is not in a group");
	await chrome.tabs.ungroup(tab.id);
	return done();
}

// Move the tab's whole group past the adjacent tab, or past the adjacent group as a whole
const moveGroupBy = async (tabId, dir) => {
	const {tab, tabs, pinnedCount} = await getTabContext(tabId);
	if (tab.groupId === NO_GROUP) return noop("Tab is not in a group");
	const range = groupRange(tabs, tab.groupId);
	const neighbor = tabs[dir < 0 ? range.start - 1 : range.end + 1];
	if (!neighbor || neighbor.pinned || (dir < 0 && range.start <= pinnedCount)) {
		return noop(dir < 0 ? "Group is already at the start" : "Group is already at the end");
	}
	// tabGroups.move takes the final index of the group's first tab
	const step = neighbor.groupId !== NO_GROUP ? groupRange(tabs, neighbor.groupId).size : 1;
	await chrome.tabGroups.move(tab.groupId, {index: range.start + dir * step});
	return done();
}

// Collapse or expand the current group. If the tab isn't grouped, toggle an adjacent group
// (preferring a collapsed one) so the same key re-expands a group you just collapsed.
const toggleGroupCollapse = async (tabId) => {
	const {tab, tabs} = await getTabContext(tabId);
	let groupId = tab.groupId;
	if (groupId === NO_GROUP) {
		const adjacent = [tabs[tab.index - 1], tabs[tab.index + 1]].filter((t) => t && t.groupId !== NO_GROUP);
		for (const t of adjacent) {
			if (await isCollapsed(t.groupId)) {
				groupId = t.groupId;
				break;
			}
		}
		if (groupId === NO_GROUP && adjacent.length) groupId = adjacent[0].groupId;
		if (groupId === NO_GROUP) return noop("No tab group here");
	}
	const collapse = !(await isCollapsed(groupId));
	if (collapse) {
		// Chrome can't show an active tab inside a collapsed group: activate the nearest tab outside it
		const range = groupRange(tabs, groupId);
		const active = tabs.find((t) => t.active);
		if (active && active.groupId === groupId) {
			const outside = tabs[range.end + 1] || tabs[range.start - 1];
			if (!outside) return noop("Can't collapse a group that holds every tab");
			await chrome.tabs.update(outside.id, {active: true});
		}
	}
	await chrome.tabGroups.update(groupId, {collapsed: collapse});
	return done();
}

const closeGroup = async (tabId) => {
	const {tab, tabs} = await getTabContext(tabId);
	if (tab.groupId === NO_GROUP) return noop("Tab is not in a group");
	await chrome.tabs.remove(groupRange(tabs, tab.groupId).tabIds);
	return done();
}

const REBORN_HANDLERS = {
	"move-tab-left": (tabId) => moveTabBy(tabId, -1),
	"move-tab-right": (tabId) => moveTabBy(tabId, 1),
	"move-tab-start": (tabId) => moveTabToEdge(tabId, false),
	"move-tab-end": (tabId) => moveTabToEdge(tabId, true),
	"add-tab-to-group-left": (tabId) => addTabToGroupInDirection(tabId, -1),
	"add-tab-to-group-right": (tabId) => addTabToGroupInDirection(tabId, 1),
	"new-group": newGroupWithTab,
	"remove-tab-from-group": removeTabFromGroup,
	"move-group-left": (tabId) => moveGroupBy(tabId, -1),
	"move-group-right": (tabId) => moveGroupBy(tabId, 1),
	"toggle-group-collapse": toggleGroupCollapse,
	"close-group": closeGroup,
};

// Run a Reborn action against a tab; never throws, always resolves to {ok, message}
const runRebornAction = async (action, tabId) => {
	try {
		return await REBORN_HANDLERS[action](tabId);
	} catch (e) {
		return noop(String((e && e.message) || e));
	}
}

// Show a short message in the tab's Omni toast when an action did nothing
const notifyResult = (tabId, result) => {
	if (result && !result.ok && result.message) {
		chrome.tabs.sendMessage(tabId, {request: "omni-toast", message: result.message}).catch(() => {});
	}
}

// Exposed for tests / debugging from the service worker console
self.omniReborn = {run: runRebornAction, actions: getRebornActions, commands: REBORN_COMMANDS};

// Receive messages from any tab
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (REBORN_HANDLERS.hasOwnProperty(message.request)) {
		const withTab = sender.tab ? Promise.resolve(sender.tab) : getCurrentTab();
		withTab.then((tab) => tab ? runRebornAction(message.request, tab.id) : noop("No current tab")).then((result) => {
			if (sender.tab) notifyResult(sender.tab.id, result);
			sendResponse(result);
		});
		return true;
	}
	switch (message.request) {
		case "get-actions":
			resetOmni();
			sendResponse({actions: actions});
			break;
		case "switch-tab":
			switchTab(message.tab);
			break;
		case "go-back":
			goBack(message.tab);
			break;
		case "go-forward":
			goForward(message.tab);
			break;
		case "duplicate-tab":
			duplicateTab(message.tab);
			break;
		case "create-bookmark":
			createBookmark(message.tab);
			break;
		case "mute":
			muteTab(true);
			break;
		case "unmute":
			muteTab(false);
			break;
		case "reload":
			reloadTab();
			break;
		case "pin":
			pinTab(true);
			break;
		case "unpin":
			pinTab(false);
			break;
		case "remove-all":
			clearAllData();
			break;
		case "remove-history":
			clearBrowsingData();
			break;
		case "remove-cookies":
			clearCookies();
			break;
		case "remove-cache":
			clearCache();
			break;
		case "remove-local-storage":
			clearLocalStorage();
			break;
		case "remove-passwords":
			clearPasswords();
		case "history": // Fallthrough
		case "downloads":
		case "extensions":
		case "settings":
		case "extensions/shortcuts":
			openChromeUrl(message.request);
			break;
		case "manage-data":
			openChromeUrl("settings/clearBrowserData");
			break;
		case "incognito":
			openIncognito();
			break;
		case "close-window":
			closeWindow(sender.tab.windowId);
			break;
		case "close-tab":
			closeCurrentTab();
			break;
		case "search-history":
			chrome.history.search({text:message.query, maxResults:0, startTime:0}).then((data) => {
				data.forEach((action, index) => {
					action.type = "history";
					action.emoji = true;
					action.emojiChar = "🏛";
					action.action = "history";
					action.keyCheck = false;
				});
				sendResponse({history:data});
			})
			return true;
		case "search-bookmarks":
			chrome.bookmarks.search({query:message.query}).then((data) => {
				// The index property of the bookmark appears to be causing issues, iterating separately...
				data.filter(x => x.index == 0).forEach((action, index) => {
					if (!action.url) {
						data.splice(index, 1);
					}
					action.type = "bookmark";
					action.emoji = true;
					action.emojiChar = "⭐️";
					action.action = "bookmark";
					action.keyCheck = false;
				})
				data.forEach((action, index) => {
					if (!action.url) {
						data.splice(index, 1);
					}
					action.type = "bookmark";
					action.emoji = true;
					action.emojiChar = "⭐️";
					action.action = "bookmark";
					action.keyCheck = false;
				})
				sendResponse({bookmarks:data});
			})
			return true;
		case "remove":
			if (message.type == "bookmark") {
				removeBookmark(message.action);
			} else {
				closeTab(message.action);
			}
			break;
		case "search":
			chrome.search.query(
				{text:message.query}
			)
			break;
		case "restore-new-tab":
			restoreNewTab();
			break;
		case "close-omni":
			getCurrentTab().then((response) => {
				chrome.tabs.sendMessage(response.id, {request: "close-omni"});
			});
			break;
		}
});

// Get actions
resetOmni();
