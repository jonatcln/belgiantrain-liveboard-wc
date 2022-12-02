import { LitElement, html, css, nothing } from 'lit';
import { classMap } from 'lit/directives/class-map.js';

{
    function loadCss(url) {
        const link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = url;
        document.head.appendChild(link);
    }

    loadCss(
        'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700;800&display=swap'
    );
}

var LiveboardParser = {
    parse(data) {
        try {
            return LiveboardParser._parseLiveboard(data);
        } catch (error) {
            throw new Error('Liveboard api data is in an unexpected format.', {
                cause: error,
            });
        }
    },

    _parseLiveboard(data) {
        return {
            version: data.version,
            timestamp: Number(data.timestamp),
            station: data.station,
            stationinfo: LiveboardParser._parseStationInfo(data.stationinfo),
            departures: {
                number: Number(data.departures.number),
                departure: data.departures.departure.map(this._parseDeparture),
            },
        };
    },

    _parseStationInfo(data) {
        return {
            id: data.id,
            '@id': data['@id'],
            locationX: Number(data.locationX),
            locationY: Number(data.locationY),
            standardname: data.standardname,
            name: data.name,
        };
    },

    _parseDeparture(data) {
        return {
            id: Number(data.id),
            delay: Number(data.delay),
            station: data.station,
            stationinfo: LiveboardParser._parseStationInfo(data.stationinfo),
            time: Number(data.time),
            vehicle: data.vehicle,
            vehicleinfo: LiveboardParser._parseVehicleInfo(data.vehicleinfo),
            platform: data.platform,
            platforminfo: {
                name: data.platforminfo.name,
                normal: Boolean(Number(data.platforminfo.normal)),
            },
            canceled: Boolean(Number(data.canceled)),
            left: Boolean(Number(data.left)),
            isExtra: Boolean(Number(data.isExtra)),
            departureConnection: data.departureConnection,
        };
    },

    _parseVehicleInfo(data) {
        return {
            name: data.name,
            shortname: data.shortname,
            number: Number(data.number),
            type: data.type,
            '@id': data['@id'],
        };
    },
};

var LiveboardFormatter = {
    // time in seconds
    formatTime(time) {
        const dt = new Date(time * 1000);
        const hh = dt.getHours().toString().padStart(2, '0');
        const mm = dt.getMinutes().toString().padStart(2, '0');
        return `${hh}:${mm}`;
    },

    // delay in seconds
    formatDelay(delay) {
        const h = Math.floor(delay / 3600).toString();
        const m = Math.floor((delay % 3600) / 60).toString();
        return h > 0 ? `+${h}h${m.padStart(2, '0')}` : `+${m}'`;
    },
};

export class BelgiantrainLiveboard extends LitElement {
    static properties = {
        lang: { type: String },
        data: { attribute: false },
        _data: { state: true },
    };

    constructor() {
        super();
        this.lang = 'en';
    }

    willUpdate(changedProperties) {
        if (changedProperties.has('data')) {
            this._data = LiveboardParser.parse(this.data);
        }
    }

    render() {
        if (!this._data) {
            return;
        }
        return html`<div class="items-container">
            ${this._data.departures.departure.map((departure) =>
                this._renderDeparture(departure)
            )}
        </div>`;
    }

    _renderDeparture(departure) {
        const departureTime = html`<span class="item__time"
            >${LiveboardFormatter.formatTime(departure.time)}</span
        >`;

        let delayStatus = nothing;

        if (departure.delay > 0) {
            const delayBadge = html`<div
                class="item__status-badge item__status-badge--highlight"
            >
                <span>
                    ${LiveboardFormatter.formatDelay(departure.delay)}
                </span>
            </div>`;

            const delayedDepartureTime = html`<div class="item__status-badge">
                <span
                    >${LiveboardFormatter.formatTime(
                        departure.time + departure.delay
                    )}</span
                >
            </div>`;

            delayStatus = html`${delayBadge}${delayedDepartureTime}`;
        }

        let statusMessages = [];
        const isArriving = false; // TODO: find a way to derive this data
        if (isArriving) {
            statusMessages.push(html`<div class="item__status-badge">
                <span
                    >${(() => {
                        // prettier-ignore
                        switch (this.lang) {
                            case 'en': return 'arriving';
                            case 'nl': return 'komt aan';
                            case 'fr': return 'en approche';
                            case 'de': return 'kommt an';
                        }
                    })()}</span
                >
            </div>`);
        }

        const departureStatus = html`<div class="item__status">
            ${delayStatus}${statusMessages}
        </div>`;

        const vehicleInfo = html`<span class="item__vehicle"
            >${departure.vehicleinfo.type}</span
        >`;

        const platformInfo = html`<span
            class="item__platform ${classMap({
                'item__platform--highlight': !departure.platforminfo.normal,
            })}"
            >${departure.platforminfo.name}</span
        >`;

        const departureInfo = html`<div class="item__info">
            ${departureTime}${departureStatus}${vehicleInfo}${platformInfo}
        </div>`;

        const destination = html`<div class="item__destination">
            ${departure.stationinfo.name}
        </div>`;

        const notice = departure.canceled
            ? html`<div class="item__notice">
                  ${(() => {
                      // prettier-ignore
                      switch (this.lang) {
                          case 'en': return "Doesn't run today";
                          case 'nl': return 'Rijdt vandaag niet';
                          case 'fr': return "Ne roule pas aujourd'hui";
                          case 'de': return 'Heute nicht fahren';
                    }
                  })()}
              </div>`
            : nothing;

        return html`<div
            class="item ${classMap({
                'item--left': departure.left,
                'item--canceled': departure.canceled,
                'item--extra': departure.isExtra,
            })}"
        >
            ${departureInfo}${destination}${notice}
        </div>`;
    }

    static styles = css`
        * {
            box-sizing: border-box;
        }
        .items-container {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: stretch;
            align-content: stretch;
            flex-wrap: wrap;
            gap: 0.625rem;
            padding: 0.625rem;
            font-family: 'Fira Sans', sans-serif;
            font-size: 1.25rem;
        }
        .item:nth-of-type(even) {
            --item-bg: #008cec;
        }
        .item:nth-of-type(odd) {
            --item-bg: #005fe6;
        }
        .item {
            --highlight-bg: #df2828;
            --highlight-fg: white;
            --item-padding: 0.5rem;
            background-color: var(--item-bg);
            color: white;
            padding: var(--item-padding);
        }
        .item--left {
            opacity: 0.35;
        }
        .item--canceled:nth-of-type(n) {
            --item-bg: #2d4a73;
        }
        .item--canceled > *:not(.item__notice) {
            text-decoration: line-through;
        }
        .item--extra .item__time {
            text-decoration: underline;
        }
        .item__info {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            gap: 0.75rem;
            align-items: baseline;
        }
        .item__time {
            font-weight: 800;
            font-variant: tabular-nums;
        }
        .item__status {
            flex-grow: 1;
            --badge-height: 1.75rem;
            margin-top: -0.2rem;
            margin-bottom: -0.2rem;
        }
        .item__status-badge {
            --badge-bg: white;
            --badge-fg: var(--item-bg);
            --badge-px: 0.4rem;
            background-color: var(--badge-bg);
            color: var(--badge-fg);
            height: var(--badge-height);
            display: inline-flex;
            align-items: center;
            justify-content: left;
            position: relative;
            padding: 0rem var(--badge-px);
            white-space: nowrap;
        }
        .item__status-badge:not(:last-of-type)::before,
        .item__status-badge:only-of-type::before {
            content: '';
            display: block;
            z-index: 1;
            position: absolute;
            top: 0;
            right: calc(-0.5 * var(--badge-height));
            transform: rotate(45deg) scale(0.707106781 /* = 1/sqrt(2) */);
            width: var(--badge-height);
            height: var(--badge-height);
            background-color: var(--badge-bg);
        }
        .item__status-badge:not(.item__status-badge--highlight):not(
                :last-of-type
            )::after {
            content: '';
            display: block;
            z-index: 1;
            position: absolute;
            top: 0;
            right: calc(-0.5 * var(--badge-height));
            transform: rotate(45deg)
                scale(0.8 /* slightly bigger than 1/sqrt(2) */);
            width: var(--badge-height);
            height: var(--badge-height);
            border-width: 2px 2px 0 0;
            border-color: var(--item-bg);
            border-style: solid;
            box-sizing: border-box;
        }
        .item__status-badge:only-of-type {
            margin-right: calc(0.5 * var(--badge-height));
        }
        .item__status-badge:not(:first-of-type) {
            padding-left: calc(0.5 * var(--badge-height) + var(--badge-px));
        }
        .item__status-badge > span {
            z-index: 1;
        }
        .item__status-badge--highlight {
            --badge-bg: var(--highlight-bg);
            --badge-fg: var(--highlight-fg);
            font-weight: 700;
        }
        .item__vehicle {
            min-width: 3rem;
            padding: 0 0.5rem;
            text-align: right;
        }
        .item__platform {
            min-width: 2rem;
            padding: 0 0.5rem;
            text-align: center;
        }
        .item__platform--highlight {
            background-color: white;
            color: var(--item-bg);
        }
        .item__destination {
            margin-top: 0.5rem;
        }
        .item__notice {
            background-color: var(--highlight-bg);
            color: var(--highlight-fg);
            margin: calc(-1 * var(--item-padding));
            margin-top: var(--item-padding);
            padding: 0.2rem var(--item-padding);
        }
    `;
}
