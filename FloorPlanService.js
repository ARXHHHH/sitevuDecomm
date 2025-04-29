import { Promise } from 'es6-promise';
import axios from './axios';
import config from 'config';
import serializeStoreService from 'utils/SerializeStoreService';
import _ from 'lodash';
import pako from 'pako';

const username = config.oneNetworkServices.cndDiscoveryUser;
const password = config.oneNetworkServices.cndDiscoveryPassword;

export class FloorPlanService {
  constructor() {
    this.endpointUrl = config.oneNetworkServices.url;

    this.isCnd=config.oneNetworkServices.isCnd;
    this.iconServicesURL = config.oneNetworkServices.iconServicesURL;
    this.cndUrl = config.oneNetworkServices.iconServicesURL;
    this.servicesURL = config.oneNetworkServices.iconServicesURL;
    this.session = serializeStoreService.session;
  }

  static friendlyCardColumnNames(data) {
    // const output = {}

    let {
      displayModeInd,
      hrzntl_crdnt_num,
      vrtcl_crdnt_num,
      hghtQty,
      wdthQty,
      wghtQty,
      cardOrderNum,
      faceLblTxt,
      ctlgId,
      ...rest
    } = data;

    let output = {
      units: displayModeInd || 'U',
      x: hrzntl_crdnt_num,
      y: vrtcl_crdnt_num,
      height: hghtQty,
      width: wdthQty,
      weight: wghtQty,
      num: { text: cardOrderNum },
      name: { text: faceLblTxt },
      catalogId: ctlgId,
      ...rest,
    };

    return output;
  }

  getFloorPlan(site, building, floor) {
    let endpointUrl = `${this.endpointUrl}/productcatalog/getRows/${site}/${building}/${floor}`;
    return new Promise((resolveCallback, rejectCallback) => {
      axios
        .get(endpointUrl)
        .then(response => {
          resolveCallback(response.data);
        })
        .catch(error => {
          rejectCallback(error);
        });
    });
  }

  // getFloorPlanRacksStr2(floor, subcls, vendor){
  //   let endpointUrl = `${this.endpointUrl}/productcatalog/getRacks/${floor}/${subcls}/${vendor}`;

  //   return new Promise((resolveCallback, rejectCallback) => {
  //     axios
  //       .get(endpointUrl)
  //       .then(response => {
  //         resolveCallback(response.data);
  //       })
  //       .catch(error => {
  //         rejectCallback(error);
  //       });
  //   });

  // }

  getFloorPlanRacksStr2(clliCd, siteCd, structureName, floorName, eqpType, vendor){
    let endpointUrl = `${this.cndUrl}/equipment-search/getRacks/${clliCd}/${siteCd}/${structureName}/${floorName}/${eqpType}/${vendor}`;

    return new Promise((resolveCallback, rejectCallback) => {
      axios.get(endpointUrl)
        .then(response => {
          resolveCallback(response.data);
        })
        .catch(error => {
          rejectCallback(error);
        });
    });
  }

  getFloorPlanRacksByZone(zoneId) {
    let endpointUrl = `${this.endpointUrl}/productcatalog/getZoneRacks/${zoneId}`;

    return new Promise((resolveCallback, rejectCallback) => {
      axios
        .get(endpointUrl)
        .then(response => {
          resolveCallback(response.data);
        })
        .catch(error => {
          rejectCallback(error);
        });
    });
  }

  getTreeViewRacksByZone(clliCd, siteCd, structureName, zoneName) {
    let url = `${this.cndUrl}/equipment-search/getZoneRacks/${clliCd}/${siteCd}/${structureName}/${zoneName}`;

    return new Promise((resolveCallback, rejectCallback) => {
      axios.get(url)
        .then(response => {
          resolveCallback(response.data);
        })
        .catch(error => {
          rejectCallback(error);
        });
    });
  }

  async unzipBlobToString(input) {
    const reader = new FileReader();
    const result = new Promise((resolve, reject) => {
      reader.onload = () => {
        try {
          const data = new Uint8Array(reader.result);
          const unzipped = pako.inflate(data, { to: 'string' });
          resolve(unzipped);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => {
        reject(reader.error);
      };
    });
    reader.readAsArrayBuffer(input);
    return await result;
  }

  async getFloorPlanRacks(site, building, floor, majorVendorId) {
    let projectId = parseInt(
      serializeStoreService.projectInfo.subphase != undefined
        ? serializeStoreService.projectInfo.subphase.projectId
        : -1,
    );

    let endpointUrl;

    if (this.isCnd) {
      // CND - GREEN
      // endpointUrl = `http://localhost:8082/getRacks/${site}/${building}/${floor}/${projectId}/true/v2`;
      endpointUrl = `${this.cndUrl}/equipment-search/getRacks/${site}/${building}/${floor}/${projectId}/true/v2`;

    } else {
      // ICON _ RED
      endpointUrl = `${this.endpointUrl}/productcatalog/getRacks/${site}/${building}/${floor}/${projectId}/true`;
    }

    try {
      const response = await axios.get(endpointUrl, { responseType: 'blob' });
      const unzippedString = await this.unzipBlobToString(response.data);
      return JSON.parse(unzippedString);
    } catch (error) {
      console.error('Error fetching or unzipping floor plan:', error);
      throw error;
    }
  }

  getFloorPlanRacksV1(site, building, floor, majorVendorId) {
    let projectId = parseInt(
      serializeStoreService.projectInfo.subphase != undefined
        ? serializeStoreService.projectInfo.subphase.projectId
        : -1,
    );

    let endpointUrl;

    if (this.isCnd) {
      // CND - GREEN
      endpointUrl = `${this.cndUrl
    }/equipment-search/getRacks/${site}/${building}/${floor}/${projectId}/true`;

    }
    else {
      // ICON _ RED
      endpointUrl = `${this.endpointUrl
        }/productcatalog/getRacks/${site}/${building}/${floor}/${projectId}/true`;

    }

    return new Promise((resolveCallback, rejectCallback) => {
      axios
        .get(endpointUrl)
        .then(response => {
          resolveCallback(response.data);
        })
        .catch(error => {
          rejectCallback(error);
        });
    });
  }
  getFloorPlanRack(site, building, floor, floorId, subClass, vendor) {
    // let endpointUrl = `${this.servicesURL}/equipment-search/v1/getRackDetails`;
    let endpointUrl = `${this.endpointUrl}/productcatalog/getperRacks/${floorId}`;

    return new Promise((resolveCallback, rejectCallback) => {
      let data = {
        siteId: site.toString(),
        floorId: floorId.toString(),
        vendor: vendor, eqptSubclsCd: subClass,
      }
      axios
        .post(endpointUrl, data)
        .then(response => {
          resolveCallback(response.data);
        })
        .catch(error => {
          rejectCallback(error);
        });
    });
  }
  getFloorPlanRacks2(floorId) {
    let endpointUrl = `${this.endpointUrl}/productcatalog/getperRacks/${floorId}`;
    return new Promise((resolveCallback, rejectCallback) => {
      axios
        .get(endpointUrl)
        .then(response => {
          resolveCallback(response.data);
        })
        .catch(error => {
          rejectCallback(error);
        });
    });
  }

  getFloorDetails(site, building, floor) {
    if (site !== '') {
      let endpointUrl = `${this.endpointUrl}/productcatalog/getFloorDet/${site}/${building}/${floor}`;
      return new Promise((resolveCallback, rejectCallback) => {
        axios
          .get(endpointUrl)
          .then(response => {
            resolveCallback(response.data);
          })
          .catch(error => {
            rejectCallback(error);
          });
      });
    }
  }

  getClliFromCllinet(clliCd) {
    let endpointUrl = `${this.endpointUrl}/projectview/updateScisSite/${clliCd}`;
    return new Promise((resolveCallback, rejectCallback) => {
      axios
        .get(endpointUrl)
        .then(response => {
          resolveCallback(response.data);
        })
        .catch(error => {
          rejectCallback(error);
        });
    });
  }

  getFloorZones(floorId, isSiteMgmt = false) {
    const endpointUrl = `${this.endpointUrl}/productcatalog/getZones/${floorId}?isSiteMgmt=${isSiteMgmt}`;
    return new Promise((resolveCallback, rejectCallback) => {
      axios
        .get(endpointUrl)
        .then(response => {
          resolveCallback(response.data);
        })
        .catch(error => {
          rejectCallback(error);
        });
    });
  }

  getZonesRacks(zoneId) {
    let endpointUrl = `${this.endpointUrl}/productcatalog/getZoneRacks/${zoneId}`;
    return new Promise((resolveCallback, rejectCallback) => {
      const config = {
        headers: { 'access-control-allow-origin': '*' },
      };
      axios
        .get(endpointUrl, config)
        .then(response => {
          resolveCallback(response.data);
        })
        .catch(error => {
          rejectCallback(error);
        });
    });
  }

  getCardView(shelfInstanceId) {
    let projId =
      serializeStoreService.projectInfo.subphase !== undefined
        ? serializeStoreService.projectInfo.subphase.projectId
        : -1;
    let endpointUrl = `${this.endpointUrl
      }/productcatalog/getCardViewCC/${shelfInstanceId}/${projId}/true`;
    return new Promise((resolveCallback, rejectCallback) => {
      const config = {
        headers: { 'access-control-allow-origin': '*' },
      };
      axios
        .get(endpointUrl, config)
        .then(response => {
          resolveCallback(response.data);
        })
        .catch(error => {
          rejectCallback(error);
        });
    });
  }

  getInnerShelfViewWithSubCards(shelfInstanceId) {
    const projId =
      serializeStoreService.projectInfo.subphase !== undefined
        ? serializeStoreService.projectInfo.subphase.projectId
        : -1;

    let endpointUrl;

    if (this.isCnd) {
      // CND - GREEN
      endpointUrl = `${this.cndUrl
      }/slot-card-search/getCardViewShelf/${shelfInstanceId}/${projId}/true`;
    }

    return new Promise((resolveCallback, rejectCallback) => {
      const requestConfig = {
        headers: { 'access-control-allow-origin': '*' },
      };
      axios
        .get(endpointUrl, requestConfig)
        .then(response => {
          response.data.sort((a, b) => a.level - b.level);
          resolveCallback(response.data);
        })
        .catch(error => {
          rejectCallback(error);
        });
    });
  }

  getCardViewWithSubCards(shelfInstanceId) {
    const projId =
      serializeStoreService.projectInfo.subphase !== undefined
        ? serializeStoreService.projectInfo.subphase.projectId
        : -1;

    let endpointUrl;

    if (this.isCnd) {
      // CND - GREEN
      endpointUrl = `${this.cndUrl
      }/slot-card-search/getCardViewSC/${shelfInstanceId}/${projId}/true`;
    }
    else {
      // ICON _ RED
      endpointUrl = `${this.endpointUrl
        }/productcatalog/getCardViewSC/${shelfInstanceId}/${projId}/true`;
    }

    return new Promise((resolveCallback, rejectCallback) => {
      const requestConfig = {
        headers: { 'access-control-allow-origin': '*' },
      };
      axios
        .get(endpointUrl, requestConfig)
        .then(response => {
          response.data.sort((a, b) => a.level - b.level);
          resolveCallback(response.data);
        })
        .catch(error => {
          rejectCallback(error);
        });
    });
  }

  getRackCardView(rackInstanceId) {
    let projId =
      serializeStoreService.projectInfo.subphase !== undefined
        ? serializeStoreService.projectInfo.subphase.projectId
        : -1;
        let endpointUrl;
        if(this.isCnd){
          //endpointUrl = `${"http://localhost:8084"}/getCardViewRC/${rackInstanceId}/${projId}/true`;
          endpointUrl = `${this.cndUrl}/slot-card-search/getCardViewRC/${rackInstanceId}/${projId}/true`;
        }
        else {
          endpointUrl = `${
            this.endpointUrl
            }/productcatalog/getCardViewRC/${rackInstanceId}/${projId}/true`;
        }
    return axios.get(endpointUrl).then(response => response.data);
  }

  searchSites(searchStr) {
    let userId = serializeStoreService.session.userId;
    if (searchStr !== undefined) {
      //const endpointUrl = `${this.endpointUrl}/productcatalog/findSite/${searchStr}?userId=${userId}`;
      let endpointUrl;
      if (this.isCnd) {
        // CND - GREEN
        endpointUrl = `${this.cndUrl}/location-search/findSite/${searchStr}?userId=${userId}`;
      }
      else {
        // ICON _ RED
        endpointUrl = `${this.endpointUrl}/productcatalog/findSite/${searchStr}?userId=${userId}`;
      }
      return new Promise((resolveCallback, rejectCallback) => {
        axios
          .get(endpointUrl)
          .then(response => {
            resolveCallback(response.data);
          })
          .catch(error => {
            rejectCallback(error);
          });
      });
    }
  }

  searchSitesByAddress(address, start = 0, limit = 50) {
    let url;
    if(this.isCnd) {
      url = `${this.cndUrl}/location-search/findSiteAddress/${address}?start=${start}&limit=${limit}`;
    } else {
      url = `${this.endpointUrl}/productcatalog/findSiteAddress/${address}?start=${start}&limit=${limit}`;
    }

    return new Promise((resolveCallback, rejectCallback) => {
      axios
        .get(url)
        .then(response => {
          resolveCallback(response.data);
        })
        .catch(error => {
          rejectCallback(error);
        });
    });
  }

  getStructures(siteId, isSiteMgmt = false) {
    const endpointUrl = `${this.endpointUrl}/productcatalog/getSiteStrc/${siteId}?isSiteMgmt=${isSiteMgmt}`;
    return new Promise((resolveCallback, rejectCallback) => {
      axios
        .get(endpointUrl, config)
        .then(response => {
          resolveCallback(response.data);
        })
        .catch(error => {
          rejectCallback(error);
        });
    });
  }

  getFloors(structureId) {
    let endpointUrl = `${this.endpointUrl}/productcatalog/getStrcsFloor/${structureId}`;
    return new Promise((resolveCallback, rejectCallback) => {
      axios
        .get(endpointUrl)
        .then(response => {
          resolveCallback(response.data);
        })
        .catch(error => {
          rejectCallback(error);
        });
    });
  }


  getSubsiteStructures(subsiteId) {

    let endpointUrl = `${this.endpointUrl}/productcatalog/getsubSiteStrc/${subsiteId}`;
    return new Promise((resolveCallback, rejectCallback) => {
      axios
        .get(endpointUrl)
        .then(response => {
          resolveCallback(response.data);
        })
        .catch(error => {
          console.log(error);
          rejectCallback([]);
        });
    });

  }


  getSubsiteStructureFloors(subsiteId, structureId) {
    ///productcatalog/getSubsiteFloor/structure/{structureId}/subSite/{siteId}
    let endpointUrl = `${this.endpointUrl}/productcatalog/getSubsiteFloor/structure/${structureId}/subSite/${subsiteId}`;
    return new Promise((resolveCallback, rejectCallback) => {
      axios
        .get(endpointUrl)
        .then(response => {
          resolveCallback(response.data);
        })
        .catch(error => {
          console.log(error);
          rejectCallback([]);
        });
    });
  }

  getSubsiteFloors(subsiteId) {
    let endpointUrl = `${this.endpointUrl}/productcatalog/getSubsiteFloor/${subsiteId}`;
    return new Promise((resolveCallback, rejectCallback) => {
      axios
        .get(endpointUrl)
        .then(response => {
          resolveCallback(response.data);
        })
        .catch(error => {
          console.log(error);
          rejectCallback([]);
        });
    });
  }

  getSubsiteFloorZones(subsiteId, floorId) {
    let endpointUrl = `${this.endpointUrl}/productcatalog/getSubsiteZone/floor/${floorId}/subSite/${subsiteId}`;
    return new Promise((resolveCallback, rejectCallback) => {
      axios
        .get(endpointUrl)
        .then(response => {
          resolveCallback(response.data);
        })
        .catch(error => {
          console.log(error);
          rejectCallback([]);
        });
    });
  }

  getSubsiteZones(subsiteId) {
    let endpointUrl = `${this.endpointUrl}/productcatalog/getSubsiteZone/${subsiteId}`;
    return new Promise((resolveCallback, rejectCallback) => {
      axios
        .get(endpointUrl)
        .then(response => {
          resolveCallback(response.data);
        })
        .catch(error => {
          console.log(error);
          rejectCallback([]);
        });
    });
  }

  getSubsiteZoneRacks(subsiteId, zoneId) {
    let endpointUrl = `${this.endpointUrl}/productcatalog/getSubsiteRack/zone/${zoneId}/subSite/${subsiteId}`;
    return new Promise((resolveCallback, rejectCallback) => {
      axios
        .get(endpointUrl)
        .then(response => {
          resolveCallback(response.data);
        })
        .catch(error => {
          console.log(error);
          rejectCallback([]);
        });
    });
  }

  getSubsiteRacks(subsiteId) {
    let endpointUrl = `${this.endpointUrl}/productcatalog/getSubsiteRack/${subsiteId}`;
    return new Promise((resolveCallback, rejectCallback) => {
      axios
        .get(endpointUrl)
        .then(response => {
          resolveCallback(response.data);
        })
        .catch(error => {
          console.log(error);
          rejectCallback([]);
        });
    });
  }

  getFloorEqptcls(siteId, structureName, floorName) {
    // let endpointUrl = `${this.servicesURL}/projectview/EqpSubClass/${siteId}/${structureName}/${floorName}`;
    let endpointUrl = `${this.endpointUrl}/projectview/EqpSubClass/${siteId}/${structureName}/${floorName}`;
    return new Promise((resolveCallback, rejectCallback) => {
      axios
        .get(endpointUrl)
        .then(response => {
          resolveCallback(response.data);
        })
        .catch(error => {
          rejectCallback(error);
        });
    });
  }

  getFloorEqpType(siteId, structureName, floorName) {
  let endpointUrl = `https://icon-services-tpa-sit.ebiz.verizon.com/equipment-search/getEquipmentTypes/${siteId}/${structureName}/${floorName}`;
    //let endpointUrl = `${this.endpointUrl}/equipment-search/getEquipmentTypes/${siteId}/${structureName}/${floorName}`;
    return new Promise((resolveCallback, rejectCallback) => {
      axios
        .get(endpointUrl)
        .then(response => {
          resolveCallback(response.data);
        })
        .catch(error => {
          rejectCallback(error);
        });
    });
  }

  getvendor(siteId, structureName, floorName, equipmentCode) {
    let endpointUrl = `${this.endpointUrl}/projectview/Manufacturer/${siteId}/${structureName}/${floorName}/${equipmentCode}`;
    return new Promise((resolveCallback, rejectCallback) => {
      axios
        .get(endpointUrl)
        .then(response => {
          let data = response.data;
          if(data) {
            data = data.map(item => ({ ...item, vendorKeyId: item.subClass + "_" + item.majorVendorId }));
          }
          resolveCallback(data);
        })
        .catch(error => {
          rejectCallback(error);
        });
    });
  }

  getvendors(siteId, structureName, floorName, eqpType) {
    let url = `${this.cndUrl}/equipment-search/getVendorDetails/${siteId}/${structureName}/${floorName}/${eqpType}`;
    return new Promise((resolveCallback, rejectCallback) => {
      axios.get(url)
        .then(response => {
          resolveCallback(response.data);
        })
        .catch(error => {
          rejectCallback(error);
        });
    });
  }

  getFloorSubclasses(floorId, searchStr) {
    let endpointUrl;
    if (searchStr.length > 0) {
      endpointUrl = `${this.endpointUrl
        }/productcatalog/searchRacksSubCls/FloorId/${floorId}/${searchStr}`;
    } else {
      if (this.isCnd) {
        // CND - GREEN
        endpointUrl = `${this.cndUrl}/equipment-search/getRacksSubCls/FloorId/${floorId}`;
      }
      else {
        endpointUrl = `${this.endpointUrl}/productcatalog/getRacksSubCls/FloorId/${floorId}/`;
      }
    }
    return new Promise((resolveCallback, rejectCallback) => {
      axios
        .get(endpointUrl)
        .then(response => {
          resolveCallback(response.data);
        })
        .catch(error => {
          rejectCallback(error);
        });
    });
  }

  getSiteDetails(siteId) {
    let Url;
    let userId = serializeStoreService.session.userId;
    if (this.isCnd) {
      // CND - GREEN
      Url = `${this.cndUrl}/location-search/SiteDetails/${siteId}?userId=${userId}`;
    }
    else {
      // ICON _ RED
      Url = `${this.endpointUrl}/projectview/SiteDetails/${siteId}?userId=${userId}`;
    }
    return axios
      .get(Url)
      .then(response => response.data[0]);
  }

  getDedRRInfoForClli(siteId) {
    let endpointUrl;
    let userId = serializeStoreService.session.userId;

    if (this.isCnd) {
      // CND - GREEN
      endpointUrl = `${this.cndUrl}/equipment-search/getDedRRInfoForClli/${siteId}?userId=${userId}`;
    }
    else {
      // ICON _ RED
      endpointUrl = `${this.endpointUrl}/engrcepvnr/getDedRRInfoForClli/${siteId}?userId=${userId}`;
    }

    return axios
      // .get(`${this.servicesURL}/equipment-search/getDedRRInfoForClli/${siteId}`)
      .get(endpointUrl)
      .then(response => response.data);
  }

  getNIDFloorPlanRacks(clliCd, serviceId) {
    let endpointUrl = `${this.endpointUrl}/engrcepvnr/NIDRcommlcon/${clliCd}/${serviceId}`;
    return new Promise((resolveCallback, rejectCallback) => {
      const config = {
        headers: { 'access-control-allow-origin': '*' },
      };
      axios
        .get(endpointUrl, config)
        .then(response => {
          resolveCallback(response.data);
        })
        .catch(error => {
          rejectCallback(error);
        });
    });
  }

  getNIDPriorityList(clliCd, serviceId) {
    let url = `${this.endpointUrl}/engrcepvnr/NIDRecomm/${clliCd}/${serviceId}`;
    return axios.get(url).then(response => response.data.nidLocationDtoList[0].priorityDTOList);
  }

  saveNIDRecommendation(shelfTId, sId, clliCd, nfId, recommendation, selectedSlots) {
    return axios
      .post(`${this.endpointUrl}/engrcepvnr/saveNIDRecomm`, [
        {
          logicalShelf: shelfTId,
          cardPartNum: recommendation.clientCardPartNum,
          cardType: 'CARD',
          cardStatus: recommendation.clientCardStatus,
          slotRole: 'CLIENT',
          parentSlot: selectedSlots.clientSlot,
          subSlot: null,
          nfid: nfId,
          serviceId: sId,
          clliCd: clliCd,
        },
        {
          logicalShelf: shelfTId,
          cardPartNum: recommendation.clientSubCardPartNum,
          cardType: 'SUBCARD',
          cardStatus: recommendation.clientSubCardStatus,
          slotRole: 'CLIENT',
          parentSlot: selectedSlots.clientSlot,
          subSlot: selectedSlots.clientSubSlot,
          nfid: nfId,
          serviceId: sId,
          clliCd: clliCd,
        },
        {
          logicalShelf: shelfTId,
          cardPartNum: recommendation.lineCardPartNum,
          cardType: 'CARD',
          cardStatus: recommendation.lineCardStatus,
          slotRole: 'LINE',
          parentSlot: selectedSlots.lineSlot,
          subSlot: null,
          nfid: nfId,
          serviceId: sId,
          clliCd: clliCd,
        },
        {
          logicalShelf: shelfTId,
          cardPartNum: recommendation.lineSubCardPartNum,
          cardType: 'SUBCARD',
          cardStatus: recommendation.lineSubCardStatus,
          slotRole: 'LINE',
          parentSlot: selectedSlots.lineSlot,
          subSlot: selectedSlots.lineSubSlot,
          nfid: nfId,
          serviceId: sId,
          clliCd: clliCd,
        },
      ])
      .then(response => response.data);
  }

  searchClliCd(searchStr) {
    return this.searchSites(_.toUpper(searchStr)).then(sites =>
      _.chain(sites)
        .map(site => site.clliCd)
        .uniq()
        .filter(clliCd => _.isString(clliCd))
        .value(),
    );
  }

  searchTID(searchStr) {
    return axios
      .get(`${this.endpointUrl}/commonservice/searchByTID/${searchStr}`)
      .then(response => response.data);
  }
  searchRacksInSiteTree(siteId, searchString, category) {
    let url;
    if (this.isCnd) {
      url = `${this.cndUrl}/equipment-search/locateRacks/`;
      url += `${siteId}/${searchString}/${category}`;
    }
    else {
      url = `${this.endpointUrl}/productcatalog/locateRacks/`;
      url += `${siteId}/${category}?searchText=${searchString}`;
    }
    return axios.get(url).then(response => {
      const { data } = response;
      const dataLength = data.length;
      for (let index = 0; index < dataLength; index++) {
        data[index].index = index;
      }
      return data;
    });
  }
  searchRacksInSite(siteId, searchString, category) {
    let url;

    if (this.isCnd) {
      // CND - GREEN
      url = `${this.cndUrl}/equipment-search/locateRacks/`;
      url += `${siteId}/${searchString}/${category}`;
    }
    else {
      // ICON _ RED
      url = `${this.endpointUrl}/productcatalog/locateRacks/`;
      url += `${siteId}/${category}?searchText=${searchString}`;
    }

    // let url = `${this.servicesURL}/equipment-search/locateRacks/`;
    // url += `${siteId}/${searchString}/${category}`;

    return axios.get(url).then(response => {
      const { data } = response;
      const dataLength = data.length;
      for (let index = 0; index < dataLength; index++) {
        data[index].index = index;
      }
      return data;
    });
  }

  searchDiscoveryTID(tid, token) {
    return axios
      .get(`${this.iconServicesURL}/discovery-reconcile/discoveryData?tid=${tid}`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString(
            'base64'
          )}`
        }
      })
      .then(response => response.data);
  }

  relocateRack(currentFtprtInstncId, futureFtprtInstncId) {
    let endpointUrl  = this.isCnd ?
    `${this.cndUrl}/equipment-create-modify/rackRelocate` :
    `${this.endpointUrl}/projectview/rackRelocate`;

    return new Promise((resolveCallback, rejectCallback) => {
      let data = {
        currentFtprtInstncId: currentFtprtInstncId,
        futureFtprtInstncId: futureFtprtInstncId
      }
      axios
        .post(endpointUrl, data)
        .then(response => {
          resolveCallback(response);
        })
        .catch(error => {
          rejectCallback(error);
        });
    });
  }

  getTreeViewDefault() {
    let endpointUrl = `${this.iconServicesURL}/reference-data-search/v1/getMetadata?subType=siteVuDecom`;
    return new Promise((resolveCallback, rejectCallback) => {
      axios.get(endpointUrl)
        .then(response => {
          resolveCallback(response.data);
        })
        .catch(error => {
          rejectCallback(error);
        });
    });
  }
}
