window.addEventListener("DOMContentLoaded", () => {
	const progress = new YearProgress(".yr-progress");
});

class YearProgress {
	progress = 0;
	currentDate = 0;
	endDate = 0;
	timeout = null;
	fillPreview = false;

	constructor(qs) {
		this.el = document.querySelector(qs);
		this.init();
	}
	init() {
		this.el?.addEventListener("change", this.toggleFillPreview.bind(this));
		if (typeof moment === "function") this.updateAll();
	}
	getProgress() {
		// get current and end dates
		const now = moment();
		this.currentDate = now;
		this.endDate = moment(`${now.clone().add(1, "Y").year()}`);
		// get milliseconds from year to year
		const diffInMs = this.endDate.diff(now, "ms");
		const lastYear = this.endDate.clone();
		lastYear.subtract(1, "y");
		const totalMs = this.endDate.diff(lastYear, "ms");
		// progress by the millisecond
		this.progress = 1 - diffInMs / totalMs;
	}
	getStats() {
		const stats = ["M", "d", "h", "m", "s"];

		stats.forEach((stat) => {
			const countEl = this.el.querySelector(`[data-count="${stat}"]`);
			const statEl = this.el.querySelector(`[data-stat="${stat}"]`);

			if (countEl && statEl) {
				const monthsInYear = 12;
				const daysInYear = this.currentDate.isLeapYear() ? 366 : 365;
				const hoursInYear = daysInYear * 24;
				const minutesInYear = hoursInYear * 60;
				const secondsInYear = minutesInYear * 60;
				const countLeft = this.endDate.diff(this.currentDate, stat);
				let maxUnits;

				switch (stat) {
					case "M":
						maxUnits = monthsInYear;
						break;
					case "d":
						maxUnits = daysInYear;
						break;
					case "h":
						maxUnits = hoursInYear;
						break;
					case "m":
						maxUnits = minutesInYear;
						break;
					default:
						maxUnits = secondsInYear;
				}

				countEl.innerText = Utils.formatNumber(maxUnits - countLeft);
				statEl.innerText = Utils.formatNumber(maxUnits);
			}
		});
	}
	toggleFillPreview() {
		this.fillPreview = !this.fillPreview;
		this.updateFill();
	}
	updateAll() {
		this.getProgress();
		this.getStats();
		this.updateYears();
		this.updateFill();

		clearTimeout(this.timeout);
		this.timeout = setTimeout(this.updateAll.bind(this), 1e3);
	}
	updateFill() {
		const percent = Math.floor(this.progress * 100);
		const fills = Array.from(this.el?.querySelectorAll("[data-fill]"));

		fills.forEach((fill, i) => {
			let { progress } = this;
			if (this.fillPreview) progress = 1;

			const transX = -(1 - progress) * 100;

			if (fill.getAttribute("role") === "progressbar") {
				// accessible progress bar
				fill.setAttribute("aria-valuenow", percent);
				fill.style.transform = `translate3d(${transX}%,0,0)`;
			} else {
				// glow
				const inset = 0.25; // in ems
				const transXAdjust = inset * 4 * (1 - progress);
				fill.style.transform = `translate3d(calc(${transX}% + ${transXAdjust}em),0,0)`;
			}
		});

		const percentEl = this.el?.querySelector("[data-percent]");
		if (percentEl)
			percentEl.innerText = this.fillPreview ? "Fill Preview" : `${percent}%`;
	}
	updateYears() {
		// current year
		const start = this.el?.querySelector("[data-yr-start]");
		if (start) start.innerText = this.currentDate.format("Y");
		// next year
		const end = this.el?.querySelector("[data-yr-end]");
		if (end) end.innerText = this.endDate.format("Y");
	}
}

class Utils {
	static formatNumber(number) {
		return number.toLocaleString();
	}
}
